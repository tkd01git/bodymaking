window.EXERCISES = {
  'ベンチプレス': { target:['chestFront','shoulderFrontL','shoulderFrontR'], muscles:['大胸筋','三角筋前部'], lastDate:'', group:'chest', groupLabel:'胸' },
  'インクラインベンチプレス': { target:['chestFront','shoulderFrontL','shoulderFrontR'], muscles:['大胸筋上部','三角筋前部'], lastDate:'', group:'chest', groupLabel:'胸' },
  'ダンベルプレス': { target:['chestFront','shoulderFrontL','shoulderFrontR'], muscles:['大胸筋','三角筋前部'], lastDate:'', group:'chest', groupLabel:'胸' },
  'ダンベルフライ': { target:['chestFront'], muscles:['大胸筋'], lastDate:'', group:'chest', groupLabel:'胸' },
  'ディップス': { target:['chestFront','shoulderFrontL','shoulderFrontR'], muscles:['大胸筋','上腕三頭筋'], lastDate:'', group:'chest', groupLabel:'胸' },

  'ショルダープレス': { target:['shoulderFrontL','shoulderFrontR'], muscles:['三角筋','上腕三頭筋'], lastDate:'', group:'shoulder', groupLabel:'肩' },
  'サイドレイズ': { target:['shoulderFrontL','shoulderFrontR'], muscles:['三角筋中部'], lastDate:'', group:'shoulder', groupLabel:'肩' },
  'リアレイズ': { target:['upperBack'], muscles:['三角筋後部'], lastDate:'', group:'shoulder', groupLabel:'肩' },
  'アップライトロー': { target:['upperBack','shoulderFrontL','shoulderFrontR'], muscles:['三角筋','僧帽筋'], lastDate:'', group:'shoulder', groupLabel:'肩' },

  'ラットプルダウン': { target:['latFrontL','latFrontR','latBackL','latBackR','upperBack'], muscles:['広背筋','大円筋','僧帽筋下部'], lastDate:'', group:'back', groupLabel:'背中' },
  '懸垂': { target:['latFrontL','latFrontR','latBackL','latBackR','upperBack'], muscles:['広背筋','大円筋','僧帽筋中下部'], lastDate:'', group:'back', groupLabel:'背中' },
  'ベントオーバーロー': { target:['upperBack','latBackL','latBackR'], muscles:['広背筋','僧帽筋','菱形筋'], lastDate:'', group:'back', groupLabel:'背中' },
  'シーテッドロー': { target:['upperBack','latBackL','latBackR'], muscles:['広背筋','菱形筋'], lastDate:'', group:'back', groupLabel:'背中' },
  'ワンハンドローイング': { target:['upperBack','latBackL','latBackR'], muscles:['広背筋','大円筋','僧帽筋中部'], lastDate:'', group:'back', groupLabel:'背中' },

  'デッドリフト': { target:['hamL','hamR','gluteL','gluteR','upperBack','latBackL','latBackR'], muscles:['ハムストリングス','大臀筋','広背筋','僧帽筋'], lastDate:'', group:'legs', groupLabel:'脚' },
  'ルーマニアンデッドリフト': { target:['hamL','hamR','gluteL','gluteR'], muscles:['ハムストリングス','大臀筋','脊柱起立筋'], lastDate:'', group:'legs', groupLabel:'脚' },
  'スクワット': { target:['quadFrontL','quadFrontR','gluteL','gluteR'], muscles:['大腿四頭筋','大臀筋'], lastDate:'', group:'legs', groupLabel:'脚' },
  'フロントスクワット': { target:['quadFrontL','quadFrontR'], muscles:['大腿四頭筋','体幹'], lastDate:'', group:'legs', groupLabel:'脚' },
  'ランジ': { target:['quadFrontL','quadFrontR','gluteL','gluteR'], muscles:['大腿四頭筋','大臀筋','ハムストリングス'], lastDate:'', group:'legs', groupLabel:'脚' },
  'レッグプレス': { target:['quadFrontL','quadFrontR','gluteL','gluteR'], muscles:['大腿四頭筋','大臀筋'], lastDate:'', group:'legs', groupLabel:'脚' },
  'レッグカール': { target:['hamL','hamR'], muscles:['ハムストリングス'], lastDate:'', group:'legs', groupLabel:'脚' },
  'ブルガリアンスクワット': { target:['quadFrontL','quadFrontR','gluteL','gluteR'], muscles:['大腿四頭筋','大臀筋','ハムストリングス'], lastDate:'', group:'legs', groupLabel:'脚' },

  'アームカール': { target:['shoulderFrontL','shoulderFrontR'], muscles:['上腕二頭筋'], lastDate:'', group:'arms', groupLabel:'腕' },
  'ハンマーカール': { target:['shoulderFrontL','shoulderFrontR'], muscles:['上腕二頭筋','腕橈骨筋'], lastDate:'', group:'arms', groupLabel:'腕' },
  'トライセプスプレスダウン': { target:['shoulderFrontL','shoulderFrontR'], muscles:['上腕三頭筋'], lastDate:'', group:'arms', groupLabel:'腕' },
  'スカルクラッシャー': { target:['shoulderFrontL','shoulderFrontR'], muscles:['上腕三頭筋'], lastDate:'', group:'arms', groupLabel:'腕' },
  '三頭筋腕振り': { target:['shoulderFrontL','shoulderFrontR'], muscles:['上腕三頭筋'], lastDate:'', group:'arms', groupLabel:'腕' },

  'クリーン': { target:['quadFrontL','quadFrontR','gluteL','gluteR','upperBack','shoulderFrontL','shoulderFrontR'], muscles:['大腿四頭筋','大臀筋','僧帽筋','三角筋','体幹'], lastDate:'', group:'full', groupLabel:'全身' },
  'スナッチ': { target:['quadFrontL','quadFrontR','gluteL','gluteR','upperBack','shoulderFrontL','shoulderFrontR'], muscles:['大腿四頭筋','大臀筋','僧帽筋','三角筋','体幹'], lastDate:'', group:'full', groupLabel:'全身' }
};

window.MUSCLE_GROUPS = [
  { value:'chest', label:'胸' },
  { value:'back', label:'背中' },
  { value:'shoulder', label:'肩' },
  { value:'legs', label:'脚' },
  { value:'arms', label:'腕' },
  { value:'full', label:'全身' }
];

window.DEFAULT_PROFILE = {
  height: '',
  weight: '',
  goal: 'hypertrophy',
  frequency: 3,
  pbs: { benchPress: '', squat: '', deadlift: '' }
};

window.AI_ENDPOINTS = {
  training: '/api/ai/training-plan',
  recovery: '/api/ai/recovery-plan'
};

window.DRIVE_ENDPOINTS = {
  auth: '/api/drive/auth',
  callback: '/api/drive/callback',
  loadProfile: '/api/drive/profile/load',
  saveProfile: '/api/drive/profile/save',
  loadRecords: '/api/drive/records/load',
  saveRecords: '/api/drive/records/save',
  loadSleeping: '/api/drive/sleeping/load',
  saveSleeping: '/api/drive/sleeping/save'
};

window.USE_SAMPLE_DATA = false;

/*
  Tips はこの配列だけ編集すれば増やせます。
  title: 見出し
  claim: 主張
  source: 論文名・著者・年など
  method: 実験内容
  result: 結果
  category: 任意の分類名
*/
window.USE_SAMPLE_DATA = false;

window.TIPS_DATA = [
  {
    category: '筋力トレーニング',
    title: 'ウエイトトレーニングとスプリントの関係',
    claim: '筋力トレーニング直後にスプリント動作を入れることで、スプリント機能が短期的に向上する',
    source: 'Chatzopoulos et al., 2007',
    method: '競技経験のある男性を対象に、重いレジスタンス運動を行わせ、その前後で10m・30mスプリントを測定した。スプリント測定は、重いレジスタンス運動の3分前、3分後、5分後に実施された。',
    result: '3分後のスプリント能力には有意な改善は見られなかったが、5分後には10m・30mの両方でスプリントパフォーマンスが有意に向上した。したがって、重い筋力運動は、適切な休息時間を挟むことで短距離スプリント能力を一時的に高める可能性が示された。'
  },
  {
    category: 'パフォーマンス',
    title: '観客や他者の存在と出力向上',
    claim: '観客や他者の存在によって、筋力発揮やパワー発揮が高まることがある。',
    source: 'Rhea, M. R., Landers, D. M., Alvar, B. A., & Arent, S. M. (2003). The effects of competition and the presence of an audience on weight lifting performance. Journal of Strength and Conditioning Research, 17(2), 303–306.',
    method: 'レクリエーションレベルで筋力トレーニング経験のある男女32名を対象に、1RMベンチプレスを3条件で測定した。条件は、他者が同時に実施するcoaction条件、競争相手がいるcompetitive coaction条件、観客の前で実施するaudience条件であった。各条件後には覚醒状態を測定する質問紙も実施された。',
    result: '1RMベンチプレスは、coaction条件で93±43kg、competitive coaction条件で103±46kg、audience条件で105±48kgだった。coaction条件と比べて、競争条件および観客条件では有意に高い挙上重量を示した。観客条件はcoaction条件より約12.9%高く、観客や競争の存在が最大筋力発揮を高める可能性が示された。'
  }
];
