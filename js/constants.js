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
  },
  {
  category: 'メンタル',
  title: '支援者想起で主観的負荷が軽減される',
  claim: '支援者を想起すると、課題中の主観的負荷が軽くなり、出力維持や課題遂行が改善することがある。',
  source: 'Psychophysiology 掲載研究 ほか',
  method: '親しい支援者の写真を見る条件と、そうでない人物写真を見る条件で、筋出力や課題持続、主観的負荷などを比較した。',
  result: '支援者の手がかりがある条件で、パフォーマンス向上や主観的負荷低下の傾向が見られた。効果は特に関係性の強い相手で出やすかった。'
},
{
  category: 'メンタル',
  title: 'psyching-upは短距離パフォーマンスを高めることがある',
  claim: 'スタート前の psyching-up や覚醒操作は、短距離走パフォーマンスを高めることがある。ただし個人差が大きい。',
  source: 'Hammoudi-Nassib らの研究、Yerkes–Dodson law',
  method: 'imagery や覚醒水準を高める操作を行った条件と通常条件で、30mスプリントなどのパフォーマンスを比較した。',
  result: '覚醒操作によって短距離パフォーマンス改善が見られた。一方で、覚醒が高すぎる選手では逆効果になる可能性も示唆された。'
},
{
  category: '回復',
  title: '睡眠4時間では無酸素パワーが低下しやすい',
  claim: '短時間睡眠、特に4時間程度の睡眠制限は、反応時間や無酸素パワーを低下させやすい。',
  source: '2024年 RCT（Sanda競技者）ほか',
  method: '通常睡眠条件と4時間睡眠条件を比較し、Wingateテスト、反応時間、ジャンプなどの指標を測定した。',
  result: '4時間睡眠条件では、反応時間が悪化し、Wingate の最大パワー・平均パワーが低下した。単発ジャンプでは影響が小さい一方、代謝依存の高い課題で影響が出やすかった。'
}
];

/*
  Routine は「試合当日の最大出力」に関係し、効果または安全性の根拠が比較的明確なものだけを採用。
  time: 試合からの相対時刻
  action: 実行する内容
  claim/method/result/source: 根拠
*/
window.ROUTINE_DATA = [
  {
    time: '3〜2日前',
    title: '量を落として疲労を消す',
    action: '練習量を普段より大きく減らす。強度と動きの質は残すが、下半身高ボリューム、強いエキセントリック、新しい種目、強いプライオメトリクスは入れない。',
    claim: 'テーパーではトレーニング量を落とし、強度を維持する方が競技パフォーマンスを高めやすい。筋損傷を伴う刺激は数日間、スプリント能力を落とし得る。',
    method: 'Bosquetらはテーパー研究をメタ解析し、量・強度・頻度の操作とパフォーマンス変化を比較した。EIMD関連レビューでは、抵抗運動・プライオメトリクス後の筋損傷、DOMS、パフォーマンス低下を整理した。',
    result: '最も効果的だったのは「強度を維持して量を減らす」テーパー。筋損傷を伴う運動後は、スプリントやジャンプなどの高出力課題が最大72時間程度低下し得る。',
    source: 'Bosquet et al., 2007, Medicine & Science in Sports & Exercise; Byrne et al., 2004, Sports Medicine; Paulsen et al., 2012, European Journal of Applied Physiology.'
  },
  {
    time: '前日',
    title: '下半身ウエイトを入れない',
    action: '下半身ウエイトは行わない。実施するなら通常ウォームアップと軽い技術確認だけ。150m走、ランジ、スクワットの追い込み、3×10系は外す。',
    claim: '24時間前の下半身プライミングは改善が不安定で、高ボリューム刺激は短距離の初速を悪化させる可能性がある。',
    method: '24時間前に下半身レジスタンス運動を入れ、翌日のジャンプ・40mスプリントを測定した研究で、重高強度少量条件と中高強度高量条件を比較した。',
    result: '90%1RM 5×2では明確な改善が出ず、75%1RM 3×10では5mスプリントが悪化した。前日は「上積み狙い」より「疲労を増やさない」方が安全。',
    source: 'Terenzi & Moody, 2020, International Journal of Physical Education, Fitness and Sports; Rumpf et al., 2021, Sports Medicine - Open.'
  },
  {
    time: '3〜4時間前',
    title: '糖質と水分を入れる',
    action: '炭水化物1〜2g/kgを、脂質・食物繊維少なめの慣れた食事で摂る。80kgなら糖質80〜160g。水分は5〜10mL/kg、80kgなら400〜800mLを目安に開始する。',
    claim: '短距離の単発100mを糖質で直接ブーストする根拠は強くないが、長い競技日、ウォームアップ、複数ラウンドでは糖質不足と脱水を避ける価値が高い。',
    method: 'World Athleticsのスプリント栄養レビューは、スプリンターの競技前糖質摂取を整理した。ACSM等の共同声明は、運動前水分摂取とeuhydrationを整理した。',
    result: 'スプリンターには1〜4時間前に1〜2g/kgの炭水化物が実践的目安。運動4時間前から5〜10mL/kgの水分摂取で開始時の水分状態を整えることが推奨される。',
    source: 'Stellingwerff et al., 2019, International Journal of Sport Nutrition and Exercise Metabolism / World Athletics; Thomas, Erdman & Burke, 2016, Medicine & Science in Sports & Exercise.'
  },
  {
    time: '90〜60分前',
    title: '試した量だけカフェイン',
    action: 'カフェインは練習で試して問題なかった量だけ使う。第一選択は3mg/kgを60分前。80kgなら240mg。ただし普段少ないなら100〜200mgから試し、初回本番で6mg/kgは使わない。',
    claim: 'カフェインは筋力・パワー・スプリント系にも有効な可能性があり、3〜6mg/kgが最も一貫している。ただし低習慣者では不安、心拍上昇、胃腸症状、睡眠悪化の個人差が大きい。',
    method: 'ISSN position standはカフェインの競技パフォーマンス研究をレビューした。100mフィールド試験では6mg/kg摂取後に100m走タイムを測定した。',
    result: '3〜6mg/kgが最も一貫して有効で、一般的タイミングは約60分前。100m試験では6mg/kgで補正100mが約0.14秒短縮したが、量は重く、副作用と睡眠リスクがある。',
    source: 'Guest et al., 2021, Journal of the International Society of Sports Nutrition; Glaister et al., 2012, Journal of Strength and Conditioning Research.'
  },
  {
    time: '45〜15分前',
    title: '動的アップ＋短い爆発動作',
    action: '動的ウォームアップを10〜15分行い、徐々に速度を上げる。最後に短い加速・スタート・爆発的動作を少量入れる。長い静的ストレッチは避ける。',
    claim: '爆発的運動前は、短い動的ウォームアップと高速度・爆発系の仕上げが有効。長い静的ストレッチは筋力・パワーを下げる方向に働きやすい。',
    method: 'ウォームアップの系統的レビューおよび静的・動的ストレッチのレビューが、ジャンプ、スプリント、パワー課題への影響を比較した。',
    result: '動的ウォームアップは爆発系パフォーマンスを高めやすく、静的ストレッチは特に長時間実施でパワー低下のリスクがある。',
    source: 'McGowan et al., 2015, Sports Medicine; Behm & Chaouachi, 2011, European Journal of Applied Physiology.'
  },
  {
    time: '待機中',
    title: '再ウォームアップで冷やさない',
    action: '座りっぱなしにしない。集合前または可能な範囲で、2分程度の再ウォームアップを入れる。例：軽い弾み、ドリル、10m程度の加速感を1〜2回。',
    claim: 'ウォームアップ後の長い待機は筋温と神経系の準備状態を落とし得る。短い再ウォームアップは爆発系パフォーマンス維持に有効な可能性がある。',
    method: '爆発系パフォーマンスを対象に、ウォームアップ、待機時間、再ウォームアップの影響を整理したレビュー。',
    result: '長い待機前後では再ウォームアップが有効な傾向。競技規則や招集所の制約があるため、可能な範囲で最小量を行う。',
    source: 'McGowan et al., 2015, Sports Medicine; Silva et al., 2018, Sports Medicine.'
  },
  {
    time: '直後〜30分',
    title: '糖質と水分を戻す',
    action: '同日または翌日に次レースがある場合、糖質と水分をすぐ戻す。目安は糖質1.0〜1.2g/kg/時。食べにくい場合は糖質0.8g/kg/時＋たんぱく質0.4g/kg/時。80kgなら糖質80〜96g/時、または糖質64g＋たんぱく質32g/時。',
    claim: '短距離1本だけでグリコーゲンが枯渇するとは限らないが、ウォームアップと複数ラウンド・連戦では回復時間が短くなるため、糖質・水分・電解質の優先度が高い。',
    method: '運動後の筋グリコーゲン再合成と回復栄養に関するガイドライン・レビューが、糖質単独と糖質＋たんぱく質を比較した。',
    result: '短時間で回復させたい場合、1.0〜1.2g/kg/時の糖質が標準目安。十分な糖質を摂りにくい場合、糖質＋たんぱく質の併用で同程度の再合成が示される。',
    source: 'Thomas, Erdman & Burke, 2016, Medicine & Science in Sports & Exercise; Betts & Williams, 2010, Sports Medicine; Stellingwerff et al., 2019, International Journal of Sport Nutrition and Exercise Metabolism.'
  },
  {
    time: 'レース後',
    title: 'ルーティン冷却はしない',
    action: '次レースまで数時間しかない場合、太ももへのルーティンアイシングはしない。暑熱対策は日陰、送風、水かけ、冷却ベストを優先。最終レース後に痛み・炎症管理目的で短時間使うのは条件付き。',
    claim: '冷却は痛み・主観的疲労を下げる可能性がある一方、短時間後の筋出力や長期適応を下げる可能性がある。パフォーマンス目的のルーティン冷却は優先度が低い。',
    method: '冷水浴・局所冷却のレビュー、筋力トレーニング後冷却の適応研究が、筋力回復、ジャンプ、スプリント、筋肥大・筋力適応への影響を比較した。',
    result: '冷却はDOMSや主観的疲労を下げることがあるが、短時間後の爆発的出力を下げる報告があり、反復使用は筋力・筋肥大適応を鈍らせ得る。急性痛がある場合は医療判断を優先する。',
    source: 'Machado et al., 2016, Sports Medicine; Roberts et al., 2015, Journal of Physiology; Hohenauer et al., 2015, PLOS ONE.'
  }
];
