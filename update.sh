#!/bin/sh

RED='\033[0;31m';
CYAN='\033[0;36m';
RESET='\033[0m';

echo "${CYAN}Start update ...${RESET}";

check=$(git ls-files -u)
if [[ -z $check ]]; then
  echo "${CYAN}Update local git ...${RESET}";
  git add -A
  git commit -m"local update"
fi

echo "${CYAN}Update remote git ...${RESET}";

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
      check=$(git ls-files -u)
      if [[ -n $check ]]; then
        echo "${RED}There are still merge conflicts, please resolve, add and commit! Then press 'c'.${RESET}";
        input="g";
      fi
    fi
  done

  git merge;
fi

echo "${CYAN}Execute update script ...${RESET}";

node ./index.js

echo "${CYAN}Add updates and  ...${RESET}";

git add -A
git commit -m"update"
git push
