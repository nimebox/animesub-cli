/* eslint-disable no-tabs */
const fs = require('fs')
const fsp = fs.promises

const meow = require('meow')
const animesub = require('animesub-api')
const prompts = require('prompts')
const unzipper = require('unzipper')

const cli = meow(
  `
	Usage
	  $ animesub-cli <title>

	Options
    --titletype, -t  [org, pl, en] [default='org']
    --filename, -f  default is same as title with .zip extension
    --page, -p  page to scrap default=1
    --onlysearch, -os  only search without downloading subtitle [default=true]
    --silent, -s  do not display search output [default=false]
    --index, -i  pass index to download subtitle
    --unzip -u  auto unzip subtitle [default=true]
    --unzippath -up  unzip path default is current directory
    --user  download subtitles only for given user

	Examples
	  $ animesub-cli boruto
    $ animesub-cli "shingeki no kyojin" -t=org
    $ animesub-cli "shingeki no kyojin" -t=org -p=2 -os=false -s
    $ animesub-cli "shingeki no kyojin" -t=org -p=2 -os=false -i=0
`,
  {
    flags: {
      titletype: {
        type: 'string',
        alias: 't',
        default: 'org'
      },
      filename: {
        type: 'string',
        alias: 'f'
      },
      page: {
        type: 'number',
        alias: 'p',
        default: 1
      },
      onlysearch: {
        type: 'boolean',
        alias: 'os',
        default: false
      },
      silent: {
        type: 'boolean',
        alias: 's',
        default: false
      },
      index: {
        type: 'number',
        alias: 'i'
      },
      unzip: {
        type: 'boolean',
        alias: 'u',
        default: true
      },
      unzippath: {
        type: 'string',
        alias: 'up'
      },
      user: {
        type: 'string'
      }
    }
  }
)

const title = cli.input[0]
const titletype = cli.flags.titletype
let index = cli.flags.index
const page = cli.flags.page - 1
const silent = cli.flags.silent
const onlysearch = cli.flags.onlysearch
let path =
  cli.flags.filename && cli.flags.filename !== 'undefined'
    ? cli.flags.filename
    : null

const unzip = cli.flags.unzip
const unzippath = () => {
  if (cli.flags.unzippath && cli.flags.unzippath !== 'undefined') {
    return cli.flags.unzippath
  } else {
    return null
  }
}
const user =
  cli.flags.user && cli.flags.user !== 'undefined' ? cli.flags.user : null

const download = (data) => {
  animesub
    .download(data.json[index].id, data.json[index].sh)
    .then(async (file) => {
      if (!path) {
        path = `${data.json[index].title}`
      }
      fsp.writeFile(`${path}_${data.json[index].user}.zip`, file).then(() => {
        if (unzip) {
          if (unzippath()) {
            fs.createReadStream(`${path}_${data.json[index].user}.zip`).pipe(
              unzipper.Extract({ path: unzippath() })
            )
          } else {
            fs.createReadStream(`${path}_${data.json[index].user}.zip`).pipe(
              unzipper.Extract({
                path: `./${path}_${data.json[index].user}/`
              })
            )
          }
        }
      })
    })
    .catch((err) => console.error(err))
}

const findUser = (data, user) => {
  const res = data.json.filter((el) => el.user === user)

  if (res.length > 0) {
    return {
      ...data,
      json: res
    }
  } else {
    throw new Error(`Cound find user ${user}`)
  }
}

animesub
  .search(title, titletype.org, page)
  .then(async (data) => {
    const resData =
      typeof user !== 'object' && user !== null ? findUser(data, user) : data

    if (!silent) {
      console.log(cli.input[0], cli.flags)
      console.log(resData)
    }
    if (!onlysearch) {
      if (!index) {
        const response = await prompts({
          type: 'number',
          name: 'index',
          message: `Select index(from 0 to ${resData.json.length})`
        })

        index = response.index
      }
      if (user) {
        download(resData)
      } else {
        download(data)
      }
    }
  })
  .catch((err) => console.error(err))
