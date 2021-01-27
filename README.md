# zero-composer-register

# 1. Use

Add this to your `repositories` in `composer.json`

```json
{
    "type": "git",
    "url": "https://raw.githubusercontent.com/LoomZero/zero-composer-register/master/"
}
```

Now you can install all repo`s in vendor.json eg.

`composer require loomzero/zero_preprocess`

# 2. Update

```shell
git clone https://github.com/LoomZero/zero-composer-register.git
cd zero-composer-register

Update the vendor.json
node index.js # The script will automatically pull all releases and insert it into packages.json

git add -A
git commit -m"new package"
git push
```

