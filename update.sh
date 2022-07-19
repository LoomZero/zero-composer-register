#!/bin/sh

git fetch
git merge

if [[ $? != 0 ]]; then
  git ls-files -u;
  echo "There are merge conflicts, please resolve them and press 'c'.";
  
  echo "Press 'c' to continue or 'e' for exit ... "
  while [[ $input != 'c' ]]
  do
    read -n 1 input
    input="$(echo $input | tr '[A-Z]' '[a-z]')"
    echo;
    if [[ $input == 'e' ]]; then
      exit;
    fi;
    check=$(git ls-files -u)
    if [[ -n $check ]]; then
      echo "There are still merge conflicts, please resolve, add and commit!";
      input="g";
    fi
  done
fi

node ./index.js
git add -A
git commit -m"update"
git push
