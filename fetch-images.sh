#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  외부 이미지 내려받기
#
#  지금 사이트의 그림 79장은 남의 서버(imgur, studiobinder 등)에서
#  그때그때 끌어옵니다. 원본이 지워지거나 학교 네트워크에서 막히면
#  학생 화면에서 사라집니다.
#
#  이 스크립트가 그 79장을 전부 내려받아 img-ext/ 폴더에 넣고,
#  index.html 의 주소를 내 폴더 안 경로로 바꿔줍니다.
#
#  ▶ 사용법 : 터미널에서
#       cd (이 폴더)
#       bash fetch-images.sh
#
#  ▶ 반드시 집이나 개인 네트워크에서 실행하세요.
#    학교망은 imgur 같은 사이트를 막아둔 경우가 많습니다.
#
#  ▶ 실행 전에 index.html 을 자동 백업합니다. 여러 번 돌려도 안전하고,
#    이미 받은 그림은 건너뜁니다.
# ══════════════════════════════════════════════════════════════
set -uo pipefail
cd "$(dirname "$0")" || exit 1

HTML="index.html"
DIR="img-ext"
MAP=".fetch-map.tsv"

# ── 준비 확인 ────────────────────────────────────────────────
for c in curl perl file; do
  command -v "$c" >/dev/null || { echo "❌ '$c' 명령이 없습니다. 맥 기본 도구인데 이상하네요."; exit 1; }
done
if   command -v shasum  >/dev/null; then HASH="shasum"
elif command -v sha1sum >/dev/null; then HASH="sha1sum"
else echo "❌ shasum 명령이 없습니다."; exit 1; fi
[ -f "$HTML" ] || { echo "❌ 이 폴더에 index.html 이 없습니다. 폴더를 확인하세요."; exit 1; }

BAK="index_bak_$(date +%Y%m%d_%H%M%S).html"
cp "$HTML" "$BAK"
mkdir -p "$DIR"
: > "$MAP"

UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
ACC='image/avif,image/webp,image/apng,image/*,*/*;q=0.8'

# ── 대상 주소 뽑기 (유튜브 썸네일은 제외 — 유튜브가 알아서 서비스합니다) ──
URLS=$(grep -o 'src="https\{0,1\}://[^"]*"' "$HTML" \
       | sed 's/^src="//; s/"$//' \
       | grep -v 'i\.ytimg\.com' \
       | sort -u)
TOTAL=$(printf '%s\n' "$URLS" | grep -c . )

echo ""
echo "  내려받을 그림 : ${TOTAL}장"
echo "  저장 위치     : $DIR/"
echo "  백업          : $BAK"
echo "  ─────────────────────────────────────────────"
echo ""

OK=0; SKIP=0; FAIL=0
FAILED_FILE="fetch-failed.txt"; : > "$FAILED_FILE"
i=0

while IFS= read -r URL; do
  [ -z "$URL" ] && continue
  i=$((i+1))
  KEY=$(printf '%s' "$URL" | $HASH | cut -c1-12)
  NUM=$(printf '%3d/%d' "$i" "$TOTAL")

  # 이미 받아둔 게 있으면 건너뛴다
  EXIST=$(ls "$DIR"/"$KEY".* 2>/dev/null | head -1)
  if [ -n "$EXIST" ]; then
    printf '%s  건너뜀   %s\n' "$NUM" "$(basename "$EXIST")"
    printf '%s\t%s\n' "$URL" "$EXIST" >> "$MAP"
    SKIP=$((SKIP+1)); continue
  fi

  ORIGIN=$(printf '%s' "$URL" | sed -E 's#^(https?://[^/]+)/.*#\1/#')
  TMP="$DIR/.tmp_$KEY"

  # 1차: 브라우저인 척 + Referer  /  2차: Referer 빼고  /  3차: http 로
  curl -fsSL --max-time 30 -A "$UA" -H "Accept: $ACC" -e "$ORIGIN" -o "$TMP" "$URL" 2>/dev/null \
   || curl -fsSL --max-time 30 -A "$UA" -H "Accept: $ACC"            -o "$TMP" "$URL" 2>/dev/null \
   || curl -fsSL --max-time 30 -A "$UA" -H "Accept: $ACC"            -o "$TMP" "${URL/https:/http:}" 2>/dev/null \
   || true

  if [ ! -s "$TMP" ]; then
    rm -f "$TMP"
    ALT=$(grep -o "<img[^>]*src=\"$URL\"" "$HTML" 2>/dev/null | head -1 | sed -E 's/.*alt="([^"]*)".*/\1/')
    printf '%s  ✗ 실패   %.66s\n' "$NUM" "${ALT:-$URL}"
    printf -- '- %s\n    %s\n' "${ALT:-(설명 없음)}" "$URL" >> "$FAILED_FILE"
    FAIL=$((FAIL+1)); continue
  fi

  MIME=$(file -b --mime-type "$TMP")
  case "$MIME" in
    image/jpeg) EXT=jpg ;;  image/png)  EXT=png ;;
    image/gif)  EXT=gif ;;  image/webp) EXT=webp ;;
    image/avif) EXT=avif ;; image/svg*) EXT=svg ;;
    *)  rm -f "$TMP"
        printf '%s  ✗ 실패   그림이 아님(%s)  %.50s\n' "$NUM" "$MIME" "$URL"
        printf -- '- 그림 대신 %s 가 왔습니다\n    %s\n' "$MIME" "$URL" >> "$FAILED_FILE"
        FAIL=$((FAIL+1)); continue ;;
  esac

  mv "$TMP" "$DIR/$KEY.$EXT"
  SIZE=$(( $(wc -c < "$DIR/$KEY.$EXT") / 1024 ))
  printf '%s  ✓ 받음   %s.%s  (%sKB)\n' "$NUM" "$KEY" "$EXT" "$SIZE"
  printf '%s\t%s/%s.%s\n' "$URL" "$DIR" "$KEY" "$EXT" >> "$MAP"
  OK=$((OK+1))
  sleep 0.15
done <<< "$URLS"

# ── index.html 안의 주소 바꾸기 ──────────────────────────────
REPLACED=$(perl -e '
  my ($map,$html)=@ARGV;
  my %m;
  open(my $f,"<",$map) or exit 0;
  while(<$f>){ chomp; my ($u,$p)=split /\t/; $m{$u}=$p if $u && $p; }
  close $f;
  exit 0 unless %m;
  open($f,"<:raw",$html) or die; local $/; my $s=<$f>; close $f;
  my $n=0;
  for my $u (sort { length($b) <=> length($a) } keys %m){
    $n += ($s =~ s/"\Q$u\E"/"$m{$u}"/g);
  }
  open(my $o,">:raw",$html) or die; print $o $s; close $o;
  print $n;
' "$MAP" "$HTML")

echo ""
echo "  ─────────────────────────────────────────────"
echo "  받음 ${OK}장 · 이미 있던 것 ${SKIP}장 · 실패 ${FAIL}장"
echo "  index.html 안 주소 ${REPLACED:-0}곳을 내 폴더 경로로 교체했습니다."
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "  ⚠ 못 받은 ${FAIL}장은 원래 주소를 그대로 두었습니다."
  echo "    사이트에서는 빈칸 대신 그림 설명 문구가 표시되니 그냥 두셔도 됩니다."
  echo "    어떤 그림인지 목록으로 남겼습니다 → $FAILED_FILE"
  echo ""
  echo "    다시 시도해볼 만한 것 —"
  echo "      · 학교망이면 집 네트워크에서 한 번 더 실행"
  echo "      · VPN을 켜고 실행 (imgur 은 국내에서 간헐적으로 막힙니다)"
  echo "      · 그래도 안 되면 그 주소를 브라우저에 붙여넣어 직접 저장한 뒤"
  echo "        $DIR/ 에 넣고 index.html 에서 주소만 바꿔주세요"
  echo ""
fi

rm -f "$MAP"
echo "  끝났습니다. index.html 을 더블클릭해서 확인해보세요."
echo "  되돌리려면 $BAK 을 index.html 로 이름 바꾸면 됩니다."
echo ""
