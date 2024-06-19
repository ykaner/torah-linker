# Description
This is a chrome extension to find on the web references to a torah pages
Available at chrome web store: https://chromewebstore.google.com/detail/sefaria-linker/olhabmaobkonkdiffhmbhoepmeklglka
# Build
Build for development
```bash
webpack --config config/webpack.config.js --mode development -d inline-source-map
```
Build for production
```sh
webpack --config config/webpack.config.js --mode production
```