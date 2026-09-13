#!/bin/bash
# 배포 주소를 index.html 의 메타태그에 채워 넣습니다.
# 카카오톡·메신저로 링크를 보낼 때 미리보기 이미지가 뜨게 하는 용도입니다.
#
#   사용법: bash set-url.sh https://아이디.github.io/저장소이름/
set -uo pipefail
cd "$(dirname "$0")" || exit 1
if [ $# -ne 1 ]; then
  echo "사용법: bash set-url.sh https://아이디.github.io/저장소이름/"
  echo "예시  : bash set-url.sh https://chogeonhwi.github.io/filmitda-study/"
  exit 1
fi
case "$1" in https://*) ;; *) echo "❌ https:// 로 시작하는 주소를 넣어주세요."; exit 1;; esac
U="${1%/}/"
N=$(grep -c 'GITHUB_USER\.github\.io/REPO_NAME' index.html)
if [ "$N" -eq 0 ]; then
  echo "이미 주소가 채워져 있습니다. 현재 값:"
  grep -o '<meta property="og:url" content="[^"]*"' index.html
  exit 0
fi
perl -i -pe "s{https://GITHUB_USER\.github\.io/REPO_NAME/}{$U}g" index.html
echo "✓ ${N}곳을 $U 로 바꿨습니다."
