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
window.TIPS_DATA = [
  {
    category: '筋力トレーニング',
    title: 'ウエイト直後にスプリントを入れる意義',
    claim: '筋力トレーニング直後にスプリント動作を入れることで、得た出力を競技動作へ結びつけやすい可能性がある。',
    source: 'ここに論文情報を記入',
    method: 'ここに実験デザインを記入',
    result: 'ここに主要結果を記入'
  },
  {
    category: 'パフォーマンス',
    title: '観客や他者の存在と出力向上',
    claim: '観客や他者の存在によって、筋力発揮やパワー発揮が高まることがある。',
    source: 'ここに論文情報を記入',
    method: 'ここに実験デザインを記入',
    result: 'ここに主要結果を記入'
  }
];
