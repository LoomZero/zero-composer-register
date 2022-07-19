#!/bin/sh

RED='\033[0;31m';
RESET='\033[0m';

git add -A
git commit -m"local update"

git fetch
git merge

if [[ $? != 0 ]]; then
  echo "${RED}There are merge conflicts, please resolve them and press 'c'.${RESET}";
  
  echo "Press 'c' to continue or 'e' for exit ... "
  while [[ $input != 'c' ]]
  do
    read -n 1 input
    input="$(echo $input | tr '[A-Z]' '[a-z]')"
    echo;
    if [[ $input == 'e' ]]; then
      exit;
    fi;
    if [[ $input == 'c' ]]; then
      git merge-base --is-ancestor master origin/master
      if [[ $? == 0 ]]; then
        echo '0'
      else
        echo '1'
      fi
      check=$(git ls-files -u)
      if [[ -n $check ]]; then
        echo "${RED}There are still merge conflicts, please resolve, add and commit! Then press 'c'.${RESET}";
        input="g";
      fi
    fi
  done
fi
exit;
node ./index.js
git add -A
git commit -m"update"
git push
