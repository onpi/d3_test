import './style.css'
import { TreeNode } from './tree.js';

// 初期データ
let DATA = {
  "id": 1,
  "name": "家康",
  "detail": {
      "company": "テストカンパニーA",
      "license": "ビルダー特約店ライセンス1",
      "dateOfBirth": "1985年8月1日",
      "animal": "どうぶつ占い・16性格診断",
      "price": 1000
  }
}
const tree = new TreeNode(DATA, 'app');
tree.init();

document.getElementById('close').addEventListener('click', () => {
  modal.close();
});

document.getElementById('move').addEventListener('click', () => {
  console.log('移動');
  document.getElementById('move_message').style.display = 'block';
  tree.onMoveMode();

});


document.getElementById('zoom').addEventListener('click', () => {
  console.log('zoom');
  const zoomTree = new TreeNode(tree.data, 'zoomApp');
  // zoomTree.init();
  zoomTree.zoom(tree.data, tree.selectedId);
 
  document.getElementById("zoomApp").classList.add('show');
});

document.getElementById('closeZoom').addEventListener('click', () => {
  document.getElementById("zoomApp").classList.remove('show');
});


// ボタンのイベントハンドラ
document.getElementById('straightButton').addEventListener("click", () => tree.changeLinkType("straight"));
document.getElementById('curvedButton').addEventListener("click", () => tree.changeLinkType("curved"));
document.getElementById('rightAngleButton').addEventListener("click", () => tree.changeLinkType("rightAngle"));

