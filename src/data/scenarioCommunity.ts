export interface CommunityPost {
  user: string
  content: string
  likes: number
  comments: number
  time: string
}

export const SCENARIO_COMMUNITY: Record<number, Record<string, CommunityPost[]>> = {
  1: {
    '2021-04-03': [
      { user: '코린이탈출기', content: '도지코인 100만원 넣었는데 벌써 160만원 됨ㅋㅋㅋ 이게 머임', likes: 342, comments: 87, time: '3시간 전' },
      { user: '존버는승리한다', content: '머스크 형이 트윗 올릴 때마다 오르네 진짜... 이번엔 얼마까지 갈까요?', likes: 218, comments: 63, time: '5시간 전' },
      { user: '비트천재', content: '밈코인에 진지하게 투자하는 사람들 이해가 안 됐는데 지금 내가 하고 있음', likes: 195, comments: 42, time: '7시간 전' },
    ],
    '2021-04-06': [
      { user: '달나라도지', content: '머스크 트윗 뜨자마자 손이 자동으로 매수 버튼으로 감 ㅋㅋ 조건반사임', likes: 512, comments: 134, time: '2시간 전' },
      { user: '매버릭스팬', content: '달라스 매버릭스에서 도지 받는다고?? 이제 진짜 화폐네 화폐야 가즈아!!!', likes: 387, comments: 91, time: '4시간 전' },
      { user: '현실주의자', content: '솔직히 이거 버블 아님? 근본이 없잖아요... 그래도 나도 삼', likes: 156, comments: 203, time: '6시간 전' },
    ],
    '2021-04-09': [
      { user: '시총10위달성', content: 'ㅋㅋㅋㅋ 시총 10위 찍었다 도지가ㅋㅋ 세상이 미쳐돌아가네', likes: 629, comments: 178, time: '1시간 전' },
      { user: '업비트폭주', content: '오늘 거래량 비코 넘었다는 거 실화임? 도지코인이 비트코인 거래량을???', likes: 445, comments: 112, time: '3시간 전' },
      { user: '조심하세요', content: '저 팔았습니다. 이미 너무 많이 올랐어요. 분들 조심하세요', likes: 87, comments: 267, time: '5시간 전' },
    ],
    '2021-04-12': [
      { user: '바이낸스전사', content: '바이낸스 선물 나왔다!! 이제 레버리지도 가능 ㄷㄷ 불장이다', likes: 489, comments: 145, time: '2시간 전' },
      { user: '코인베이스기대', content: '코인베이스 상장되면 도지도 같이 올라갈거 아님? 암호화폐 봄날이 온다', likes: 334, comments: 78, time: '4시간 전' },
      { user: '물린사람', content: '어제 팔았는데 또 올랐네요... 저만 이런가요ㅠ', likes: 201, comments: 189, time: '6시간 전' },
    ],
    '2021-04-15': [
      { user: '코인베이스폭락', content: 'ㅋㅋㅋㅋ 소문에 사고 뉴스에 팔아라가 딱 맞았네 코인베이스 상장하자마자 떡락', likes: 392, comments: 167, time: '3시간 전' },
      { user: '존버중', content: '이게 진짜 흔들림인가 아닌가... 나는 안팜. 머스크 믿는다', likes: 287, comments: 93, time: '5시간 전' },
      { user: '분산투자러', content: '이럴 때 조금씩 더 담아야 함 ㅇㅇ 개인투자자들이 받쳐주는 코인임', likes: 234, comments: 56, time: '7시간 전' },
    ],
    '2021-04-18': [
      { user: '도지데이D-2', content: '4월 20일 도지데이까지 이틀 남았다!!!! 다들 얼마씩 들고 있어요?', likes: 734, comments: 298, time: '1시간 전' },
      { user: '1달러확신', content: '머스크가 다시 트윗 올렸다 1달러 가는 거 기정사실 아님? 지금이라도 타야하나', likes: 567, comments: 201, time: '2시간 전' },
      { user: 'SNL기대', content: '소셜미디어 매수 캠페인 + 머스크 트윗 + SNL 기대감 = 1달러는 무조건', likes: 423, comments: 134, time: '4시간 전' },
    ],
    '2021-04-21': [
      { user: '도지데이실망', content: '도지데이라고 1달러 간다더니 0.45에서 꼭대기 찍고 내려오네... 뭐냐', likes: 234, comments: 445, time: '2시간 전' },
      { user: '차익실현완료', content: '0.45에서 다 팔았습니다. 모두 행복한 투자 하세요', likes: 156, comments: 312, time: '3시간 전' },
      { user: 'SNL희망회로', content: '아직 SNL이 남았다!! 머스크가 출연할 때까지 존버하면 1달러 간다고!!', likes: 389, comments: 267, time: '5시간 전' },
    ],
    '2021-04-24': [
      { user: 'SNL확정이다', content: '머스크 SNL 5월 8일 출연 확정!!! 방송에서 도지코인 언급 안 할 이유가 없잖아!', likes: 892, comments: 334, time: '1시간 전' },
      { user: '0.3돌파', content: '0.3달러 돌파ㅋㅋㅋ 도지데이 하락은 건강한 조정이었다 레전드 코인', likes: 678, comments: 189, time: '2시간 전' },
      { user: '지금이라도', content: 'SNL 전까지 1달러 간다는데 지금이라도 사야하나요... 이미 너무 오른 거 아닐까요?', likes: 234, comments: 567, time: '4시간 전' },
    ],
    '2021-04-27': [
      { user: '역대최고가', content: '0.37달러 사상 최고가!!! 여기까지 같이 온 도지 홀더들 모두 수고해요', likes: 1203, comments: 456, time: '1시간 전' },
      { user: '업비트서버터짐', content: '업비트 터졌다 ㅋㅋㅋㅋ 주문이 너무 몰려서 매수를 못하겠네 이게 뭐야', likes: 567, comments: 289, time: '2시간 전' },
      { user: '1달러카운트다운', content: 'SNL까지 11일 남음. 현재 0.37. 하루 평균 0.056 오르면 됨. 수학적으로 가능한 숫자임', likes: 789, comments: 234, time: '3시간 전' },
    ],
    '2021-04-30': [
      { user: '0.45재돌파', content: '도지데이 고점 다시 돌파!! 이번엔 진짜로 1달러 가는 거 맞죠?', likes: 934, comments: 312, time: '2시간 전' },
      { user: '머스크월트윗', content: '머스크가 도지를 달에 올려놓겠다고 했음ㅋㅋ 스페이스X 쓰겠다는 건가?? 진심인 듯', likes: 1124, comments: 567, time: '3시간 전' },
      { user: '지금팔면바보', content: '이 시점에 파는 사람은 진짜 바보임. SNL 머스크 언급하면 1달러 넘는다', likes: 456, comments: 789, time: '5시간 전' },
    ],
    '2021-05-03': [
      { user: '0.6달러간다', content: '0.6달러 돌파ㅋㅋ 5일 뒤면 SNL이다 이제 진짜다 1달러 가즈아!!!!!', likes: 1567, comments: 678, time: '1시간 전' },
      { user: '팔까말까', content: '솔직히 지금 팔아야 하는 거 아닌가요... 제 직감이 고점이라고 하는데 버블 느낌', likes: 234, comments: 901, time: '2시간 전' },
      { user: '다이아몬드핸즈', content: '절대 안 팜. SNL 당일 1달러 찍고 파는 거 계획임. 손 안 떨림', likes: 892, comments: 345, time: '4시간 전' },
    ],
    '2021-05-06': [
      { user: '0.7근접', content: '0.69달러 사상 최고가!!!! SNL 이틀 남았다 진짜 1달러 현실이 되는 건가', likes: 2341, comments: 891, time: '1시간 전' },
      { user: '팔거냐존버냐', content: 'SNL 방송 전날 파는 게 나을까요 방송 당일 파는 게 나을까요 진짜 모르겠음', likes: 1203, comments: 2567, time: '2시간 전' },
      { user: '버블경고', content: '얘들아 진짜로... 이거 너무 올랐어. 뭔가 이상해. 조심해라', likes: 178, comments: 1234, time: '3시간 전' },
    ],
  },
}
