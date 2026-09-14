# -*- coding: utf-8 -*-
"""
2차 수정 — 선생님 결정사항 반영
    python3 2차수정-적용.py

cam4 · cam5 · cam6 · cam2 의 남은 손상 표현을 정리하고,
sc2(시나리오 창작 실무 10주)는 목록에서 내립니다.

index.html 을 자동 백업합니다. 바꾸지 못한 항목은 화면에 표시됩니다.
"""
import re, os, sys, time, shutil

os.chdir(os.path.dirname(os.path.abspath(__file__)))
P = 'index.html'
if not os.path.exists(P):
    sys.exit('❌ 이 폴더에 index.html 이 없습니다.')

s = open(P, encoding='utf-8').read()
shutil.copy(P, P.replace('.html', time.strftime('_2차수정전_%Y%m%d_%H%M.html')))

log, miss = [], []

def rep(old, new, label):
    global s
    n = s.count(old)
    if n:
        s = s.replace(old, new)
        log.append(f'  ✓ {n}곳  {label}')
    else:
        miss.append(label)

# ══════════ cam4 · 카메라 워크 & 앵글의 문법 ══════════

# 틸트 업/다운의 앵글이 뒤바뀌어 있던 것 — 서로 교체
rep('<td><strong>틸트 업</strong> (아래 → 위)</td>\n<td>하이앵글</td>',
    '<td><strong>틸트 업</strong> (아래 → 위)</td>\n<td>로우앵글</td>',
    'cam4 틸트 업 → 로우앵글')
rep('<td><strong>틸트 다운</strong> (위 → 아래)</td>\n<td>로우앵글</td>',
    '<td><strong>틸트 다운</strong> (위 → 아래)</td>\n<td>하이앵글</td>',
    'cam4 틸트 다운 → 하이앵글')
rep('<td>나약함, 저조함, 어려움 표현</td>',
    '<td>나약함, 어려움 표현</td>',
    'cam4 "저조함" 삭제')

# 삼각대 4요소 ① 장소 — 뭉개진 설명 정리
rep('<td>븱그라운드와 콘트리부션에 바른 시드 또는 멌지</td>',
    '<td>배경과 구도</td>',
    'cam4 삼각대 ① 장소 설명 정리')

# 줌 vs 달리 대비표 — 읽을 수 없는 첫 행 삭제
rep('| 로스터리스 피인트 | 변함 | 유지됨 |\n',
    '',
    'cam4 줌vs달리 표 첫 행 삭제')

# 스테디캠 — "비행" 삭제
rep('<td>비행, 움직임의 우아함 표현</td>',
    '<td>움직임의 우아함 표현</td>',
    'cam4 스테디캠 "비행" 삭제')

# 정체 불명의 장비 행 삭제
rep('<tr>\n<td><strong>추요 + 스테디캠</strong></td>\n'
    '<td>안정적 이동과 속도감 동시</td>\n'
    '<td>액션의 흐름을 받치면서도 안정</td>\n</tr>\n',
    '',
    'cam4 "추요 + 스테디캠" 행 삭제')

# ══════════ cam5 · 프레이밍과 구도 원리 ══════════

rep('<th>파낼 위치</th>',            '<th>화면 범위</th>',        'cam5 표 열 이름 → 화면 범위')
rep('<td>대화, 조사의 기본</td>',      '<td>대화, 인터뷰의 기본</td>', 'cam5 → 인터뷰의 기본')
rep('<td>군주어진 감정, 세부 강조</td>', '<td>응축된 감정, 세부 강조</td>', 'cam5 → 응축된 감정')
rep('되어 타임핀로우 조절 가능',        '되어 타임 플로우 조절 가능',   'cam5 → 타임 플로우')
rep('<td>서사시, 선사시, 우주</td>',   '<td>서사시, 우주</td>',      'cam5 "선사시" 삭제')
rep('<div class="callout co-scene"><span class="co-tag">씬</span><div class="co-body">\n<p>원포인트: 화면비는',
    '<div class="callout co-pin"><div class="co-body">\n<p>원포인트: 화면비는',
    'cam5 "씬" 딱지 삭제')
rep('비교 촬영 마진</li>',            '비교 촬영</li>',            'cam5 실습 "마진" 삭제')

# ══════════ cam6 · 편집과 촬영의 상호관계 ══════════

rep('<li>영상이 <strong>했다 시작하는 시점에서부터 내려가는 시점까지</strong> 충분한 컷을 확보</li>',
    '<li><strong>움직임이 시작해서 끝날 때까지</strong> 충분한 컷을 확보</li>',
    'cam6 움직임 시작~끝')
rep('<li>다음 컷이 <strong>컷인 다음</strong> 시작될 수 있도록 앞뒤로 여유 있게 촬영</li>',
    '<li>다음 컷이 <strong>바로</strong> 시작될 수 있도록 앞뒤로 여유 있게 촬영</li>',
    'cam6 다음 컷이 바로 시작')
rep('<strong>레이아웃 단계에서 미리 파악</strong>',
    '<strong>스토리보드(콘티) 단계에서 미리 파악</strong>',
    'cam6 → 스토리보드(콘티) 단계')
rep('담는 라이더를 기준으로',          '담는 와이드 숏을 기준으로',   'cam6 → 와이드 숏')

# 마스터 신 행 — 읽을 수 없는 촬영 팁 삭제
rep('<td><strong>마스터 신</strong></td>\n<td>전체 상황 파악</td>\n<td>잌시로 말고 취소하는 것 허용</td>',
    '<td><strong>마스터 신</strong></td>\n<td>전체 상황 파악</td>\n<td>—</td>',
    'cam6 마스터 신 촬영 팁 삭제')

# 정체 불명의 컷 종류 행 삭제
rep('<tr>\n<td><strong>데칷 슈</strong></td>\n'
    '<td>관계 안에서 서로</td>\n'
    '<td>시선의 일치, 컷사이즈 변화</td>\n</tr>\n',
    '',
    'cam6 "데칷 슈" 행 삭제')

rep('<td>함미해 최대한 크게</td>',     '<td>—</td>',                'cam6 클로즈업 촬영 팁 삭제')
rep('<td>개물, 확장, 라벨</td>',       '<td>소품 · 시계 · 라벨</td>',  'cam6 인서트 역할')
rep('<td>시선 유도할 데일에 사용</td>', '<td>디테일에 시선 유도할 때 사용</td>', 'cam6 인서트 촬영 팁')
rep('<li>켄틸렐츠 조명이 어려운 곳에서 3번에서 같은 조명을 받아야 함</li>',
    '<li>조명 컨티뉴이티 확보가 어려움</li>',
    'cam6 멀티캠 단점 → 조명 컨티뉴이티')
rep('<li>소항위 렌즈 컷의 종류가 제한됨</li>', '', 'cam6 멀티캠 단점 한 줄 삭제')
rep('<li><strong>마스터 신 없이</strong> 클로즈업 위주로 촬영한 뒤 열린 회의에서 관객에게 편집해보기</li>\n',
    '',
    'cam6 실습 3번 삭제')
rep('마스터 신로 촬영한',              '마스터 신으로 촬영한',        'cam6 조사 다듬기')

# ══════════ cam2 · 렌즈 선택과 화면 미학 ══════════
rep('<td>근듹, 서사시 도로변</td>',    '<td>서사시, 도로 장면</td>',  'cam2 "근듹" 삭제')

# ══════════ sc2 · 시나리오 창작 실무 10주 — 목록에서 내리기 ══════════

n = len(re.findall(r'<a class="nav-item"([^>]*href="#sc2")', s))
s = re.sub(r'<a class="nav-item"([^>]*href="#sc2")', r'<a class="nav-item is-hidden"\1', s)
log.append(f'  ✓ {n}곳  sc2 목차에서 숨김') if n else miss.append('sc2 목차 숨김')

n = len(re.findall(r'<a class="hc-row"([^>]*href="#sc2")', s))
s = re.sub(r'<a class="hc-row"([^>]*href="#sc2")', r'<a class="hc-row is-hidden"\1', s)
log.append(f'  ✓ {n}곳  sc2 홈 카드에서 숨김') if n else miss.append('sc2 홈 카드 숨김')

before = s
s = re.sub(r'"sc2",\s*', '', s, count=1)
log.append('  ✓ 1곳  sc2 이전/다음 이동 순서에서 제외') if s != before else miss.append('sc2 order 배열')

BANNER = ('<div class="wip-banner"><span class="wb-ic">🚧</span><div class="wb-x">'
          '<b>이 강의는 문장 교정 중입니다.</b><br>번역 과정에서 일부 문장이 손상되어 '
          '현재 목록에서 잠시 내려두었습니다. 내용을 그대로 외우지 말고, '
          '교정 완료 안내가 올라온 뒤에 학습해 주세요.</div></div>\n')
m = re.search(r'(<article class="page[^"]*" id="sc2">.*?<div class="lesson-body">\s*\n)', s, re.S)
if m and 'wip-banner' not in s[m.end():m.end()+400]:
    s = s[:m.end()] + BANNER + s[m.end():]
    log.append('  ✓ 1곳  sc2 "교정 중" 배너 추가')
elif m:
    log.append('  · sc2 배너는 이미 있습니다')
else:
    miss.append('sc2 배너 삽입 위치')

# ══════════ 저장 ══════════
open(P, 'w', encoding='utf-8').write(s)

print()
for l in log: print(l)
print(f'\n  총 {len(log)}개 항목 처리')
if miss:
    print(f'\n  ⚠ 못 찾은 항목 {len(miss)}개:')
    for m_ in miss: print(f'      {m_}')

# 검증
bad = [b for b in ['븱그라운드','로스터리스','추요','저조함','파낼','조사의 기본','군주어진',
                   '타임핀로우','선사시','촬영 마진','했다 시작','컷인 다음','레이아웃 단계',
                   '라이더','잌시로','데칷','함미해','개물','데일에','켄틸렐츠','소항위',
                   '열린 회의','근듹'] if b in s]
print('\n  남은 손상 표현:', bad if bad else '없음 ✓')
vis = len(re.findall(r'<a class="nav-item" href="#', s))
print(f'  공개 강의 수: {vis}강')
print(f'  구조: article {len(re.findall(r"<article", s))} · div 균형 '
      f'{len(re.findall(r"<div", s)) == len(re.findall(r"</div>", s))}')
print('\n  백업: index_2차수정전_*.html')
