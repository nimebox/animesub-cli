const fs = require('fs')
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
    --index, -i  pass index to download subtitle [default=0]
    --unzip -u  auto unzip subtitle [default=true]
    --unzippath -up  unzip path default is current directory

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
        alias: 'i',
        default: 0
      },
      unzip: {
        type: 'boolean',
        alias: 'u',
        default: true
      },
      unzippath: {
        type: 'string',
        alias: 'up'
      }
    }
  }
)

const title = cli.input[0]
const titletype = cli.flags.titletype
let index = cli.flags.index
const page = cli.flags.page
const silent = cli.flags.silent
const onlysearch = cli.flags.onlysearch
const path = () => {
  if (cli.flags.filename && cli.flags.filename !== 'undefined') {
    return cli.flags.filename
  } else {
    return `${title}-${index}`
  }
}
const unzip = cli.flags.unzip
const unzippath = () => {
  if (cli.flags.unzippath && cli.flags.unzippath !== 'undefined') {
    return cli.flags.unzippath
  } else {
    return `./${title}-${index}/`
  }
}

animesub
  .search(title, titletype.org, page)
  .then(async (data) => {
    if (!silent) {
      console.log(cli.input[0], cli.flags)
      console.log(data)
    }
    if (!onlysearch) {
      const response = await prompts({
        type: 'number',
        name: 'index',
        message: `Select index(from 0 to ${data.json.length})`
      })

      index = response.index

      animesub
        .download(data.json[index].id, data.json[index].sh)
        .then((file) => {
          const archivePath = fs.writeFileSync(`${path()}.zip`, file)
          if (unzip) {
            fs.createReadStream(`${path()}.zip`).pipe(
              unzipper.Extract({ path: unzippath() })
            )
          }
        })
        .catch((err) => console.error(err))
    }
  })
  .catch((err) => console.error(err))
