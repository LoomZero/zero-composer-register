TOC

- [1. - Use](#1---use)
- [2. - Update](#2---update)

# 1. - Use

Add this to your `repositories` in `composer.json`

```json
{
    "type": "composer",
    "url": "https://raw.githubusercontent.com/LoomZero/zero-composer-register/master/"
}
```

Now you can install all repo`s in vendor.json eg.

```
composer require loomzero/zero_preprocess
```

# 2. - Update

```bash
git clone https://github.com/LoomZero/zero-composer-register.git
cd zero-composer-register

Update the vendor.json

./update.sh # The script will automatically pull all releases and insert it into packages.json and push it
```
