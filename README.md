# animesub-cli

Requirements: Node.js

Install depedencies

```bash
npm i
```

then run

```bash
Usage
$ node ./animesub-cli.js <title> [commands]

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

```
