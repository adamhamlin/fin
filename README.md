# frap

A terminal UI wrapper for your "find"-like utility. Quickly perform basic operations on the results of your find command, like copying paths, file/directory names, or file contents.

[![asciicast](https://asciinema.org/a/277176.svg)](https://asciinema.org/a/277176?autoplay=1&loop=1)

## Using frap
If you want to wrap the following command with frap:
```bash
find . -name *.txt
```
Simply replace `find` with `frap`:
```bash
frap . -name *.txt
```
By default, frap will wrap the `find` command. You can specify a different find utility (such as the excellent [fd](https://github.com/sharkdp/fd) package) with the environment variable `FRAP_FIND_UTILITY`:
```bash
echo 'export FRAP_FIND_UTILITY=fd' >> ~/.bash_profile
```
>In theory, you can use frap with any command or expression that outputs newline-delimited paths.

## Navigating frap
Use arrow keys (or vi arrow keys), to navigate. Right arrow or enter selects, left arrow cancels. Press '/' to search within the returned matches. Press 'q' or 'esc' to quit.


## Installing frap

```bash
npm install -g @adamhamlin/frap
```