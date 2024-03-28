import './style.css'
import { TreeNode } from './tree.js';
import { Modal } from './modal.js';

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
const modal = new Modal('modal');
tree.init();

document.getElementById('close').addEventListener('click', () => {
  modal.close();
});

// document.getElementById('children').addEventListener('click', () => {
//   const newChildTemplate = {
//     "name": "新しい子",
//     "detail": {
//       "company": "新しい会社",
//       "license": "新しいライセンス",
//       "dateOfBirth": "生年月日",
//       "animal": "新しい占い",
//       "price": 1000
//     }
//   };
//   tree.addChild(tree.selectedId, newChildTemplate);
// });

// document.getElementById('remove').addEventListener('click', () => {
//   tree.removeChildById();
//   tree.updateTree();
//   modal.close();
// });

document.getElementById('move').addEventListener('click', () => {
  console.log('移動');
  document.getElementById('move_message').style.display = 'block';
  tree.onMoveMode();

});
// 使用例
// const root = d3.hierarchy(DATA); // D3階層データの生成
// const selectedId = 1; // 選択したい要素のID
// const descendants = findAllDescendants(root, selectedId);
// console.log(descendants); // 取得した子孫ノードの配列を表示

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

