Source code of Run-Balkan web-site

Install locally for development

```bash
git clone https://github.com/Boogier/RunBalkan.git
cd RunBalkan
npm install
```

Create a dummy `secrets.js` file:
```bash
cp src/secrets.js.template src/secrets.js
```

Run dev server:
```bash
npm start
```

Some features require keys stored in src/secrets.js. 
