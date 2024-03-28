import * as d3 from "d3";

class Tree {
  constructor(data, app_id = "app") {
    this.data = data;
    this.width = document.getElementById("app").offsetWidth;
    if (app_id === "zoomApp") {
      this.width = this.width / 2;
    }
    // window.innerWidth;
    this.height = window.innerHeight;
    // document.getElementById(app_id).offsetHeight;
    // window.innerHeight;
    this.app_id = app_id;
    this.currentLinkType = "straight";
    this.currentZoomTransform = d3.zoomIdentity;
    // ズーム設定を追加
    this.init();
  }
  _tree() {
    const root = d3.hierarchy(this.data);
    root.dx = 50; // 要素同士の横の距離感。数値を大きくすると横の余白が広がる
    root.dy = 120; // 要素同士の縦の距離感。数値を大きくすると縦の余白が広がる
    return d3.tree().nodeSize([root.dx, root.dy])(root);
  }

  init() {
    /*
     * グラフを描画する
     */
    // 既存のSVGを削除
    const existingSvg = document.querySelector(`#${this.app_id} svg`);
    if (existingSvg) {
      existingSvg.remove();
    }

    // SVGコンテナの作成
    const svg = d3
      .select(document.createElementNS(d3.namespaces.svg, "svg"))
      .attr("viewBox", [0, -40, this.width, this.height])
      .attr("width", this.width)
      .attr("height", this.height);

    // ズーム機能のためのグループ要素を作成してSVGに追加
    const gZoom = svg.append("g").attr("class", "zoom-container");

    // SVG要素をDOMに追加
    document.getElementById(this.app_id).append(svg.node());

    // ズームイベントの設定
    svg.call(
      d3
        .zoom()
        .scaleExtent([0.5, 8])
        .on("zoom", (event) => {
          gZoom.attr("transform", event.transform); // ズームとパンの変換を適用
          this.currentZoomTransform = event.transform;
        })
    );

    /* ノードとリンクのためのグループ要素を作成 */
    gZoom.append("g").attr("class", "links"); // リンク用のグループ
    gZoom.append("g").attr("class", "nodes"); // ノード用のグループ

    this.updateTree(); // ツリーの初期化
  }
  updateTree() {
    const root = this._tree(this.data);
    const self = this; // `this`を一時変数に格納しておく

    // ノードの選択と更新
    const nodes = d3
      .select(`#${this.app_id} .nodes`)
      .selectAll(".node")
      .data(root.descendants(), (d) => d.data.id);

    // 新しいノードの追加
    const nodeEnter = nodes
      .enter()
      .append("g")
      .attr("class", "node")
      // .attr("transform", d => `translate(${d.x}, ${d.y})`)
      .attr(
        "transform",
        (d) => `translate(${d.x + (this.width + d.x) / 2}, ${d.y})`
      )
      .on("click", (e, d) => {
        this.onNodeClick(d);
      });

    // テキストの追加
    nodeEnter
      .append("text")
      .attr("y", 50) // テキストの位置
      .attr("text-anchor", "middle")
      .text((d) => d.data.name + d.data.id)
      .clone(true)
      .lower()
      .attr("stroke", "white");

    // 画像の追加
    nodeEnter
      .append("image")
      .attr("xlink:href", "/public/icon.svg")
      .attr("width", 40)
      .attr("height", 40)
      .attr("x", -40 / 2) // 画像の幅の半分を左にずらす
      .attr("y", -40 / 2); // 画像の高さの半分を上にずらす;

    // 円の追加
    nodeEnter
      .append("circle")
      .attr("r", 30) // 半径
      .attr("fill", "none") // 内部は透明
      .attr("stroke", "black") // 枠線の色
      .attr("stroke-width", 2); // 枠線の太さ

    // 既存のノードを更新
    nodes
      .merge(nodeEnter)
      // .attr("transform", d => `translate(${d.x}, ${d.y})`);
      .attr(
        "transform",
        (d) => `translate(${d.x + (this.width + d.x) / 2}, ${d.y})`
      );

    // 不要になったノードの削除
    nodes.exit().remove();

    // リンクの選択と更新
    const links = d3
      .select(`#${this.app_id} svg .links`)
      .selectAll("path.link")
      .data(root.links(), (d) => `${d.source.data.id}-${d.target.data.id}`);

    // 不要になったリンクの削除
    links.exit().remove();

    // 新しいリンクの追加
    const linkEnter = links
      .enter()
      .append("path")
      .attr("class", "link")
      .attr("fill", "none")
      .attr("stroke", "#555")
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", 1.5)
      .attr("d", (d) => self.getLinkPath(d));

    // 既存のリンクを更新
    linkEnter.merge(links).attr("d", (d) => this.getLinkPath(d));
    // 保存されたズーム状態を再適用
    d3.select(`#${this.app_id} .zoom-container`).attr(
      "transform",
      this.currentZoomTransform
    );
  }

  // 直線
  straightLinePath(d) {
    // リンクの開始点と終了点を直線で結びます
    // ノード同士を繋ぐ線の座標を決定する
    return `M${d.source.x + (this.width + d.source.x) / 2},${
      d.source.y + 30
    } L${d.target.x + (this.width + d.target.x) / 2},${d.target.y - 30}`;
  }
  // 曲線
  curvedLinePath(d) {
    const linkGenerator = d3
      .linkVertical()
      .x((node) => node.x + (this.width + node.x) / 2)
      .y((node) => node.y);
    return linkGenerator(d);
  }
  // 直角に曲がる線
  rightAngleLinePath(d) {
    // リンクの開始点
    const o = {
      x: d.source.x + (this.width + d.source.x) / 2,
      y: d.source.y + 30,
    };
    // リンクの終了点
    const t = {
      x: d.target.x + (this.width + d.target.x) / 2,
      y: d.target.y - 30,
    };
    // 中間点
    const m = (o.y + t.y) / 2;
    // パスを作成（直角に曲がる）
    return `M${o.x},${o.y} V${m} H${t.x} V${t.y}`;
  }

  getLinkPath(d) {
    switch (this.currentLinkType) {
      case "straight":
        return this.straightLinePath(d);
      case "curved":
        return this.curvedLinePath(d);
      case "rightAngle":
        return this.rightAngleLinePath(d);
      default:
        return this.straightLinePath(d);
    }
  }

  changeLinkType(newType) {
    this.currentLinkType = newType;
    this.updateTree();
  }

  onNodeClick() {} // 継承先で上書き
}

export class TreeNode extends Tree {
  constructor(data, app_id = "app") {
    super(data, app_id);
    this.selectedId = 0;
    this.moveMode = false; // 要素の移動時はtrue
  }
  init() {
    super.init(this.data);
    this.calcFp();
  }
  changeLinkType(newType) {
    super.changeLinkType(newType);
    this.updateTree(); // ノード追加後にツリーを更新
  }

  onMoveMode() {
    this.moveMode = true;
  }

  offMoveMode() {
    this.moveMode = false;
  }

  onNodeClick(d) {
    /*
     * 要素クリック時に発火
     */
    let paths = d3.selectAll("path");
    let ancestors = d.ancestors();
    if (this.moveMode) {
      // 要素を移動する
      this.moveChild(this.selectedId, d.data.id);
      this.moveMode = false;
      return false;
    }

    this.selectedId = d.data.id;

    const event = new CustomEvent("nodeClick", { detail: d.data.detail });
    document.dispatchEvent(event); // モーダルにデータを渡すためのイベントを作成

    paths.style("stroke", "#555").style("stroke-opacity", 0.4);

    paths
      .filter((d) => ancestors.includes(d.target))
      .style("stroke", "red")
      .style("stroke-opacity", 1);

    this.calcFp();
  }

  addChild(id, newChildTemplate, data = this.data) {
    /*
     * 小要素を追加する
     */
    const self = this;
    if (data.id === id) {
      if (!data.children) {
        data.children = [];
      }
      const count = this.countIds(this.data);
      const newChild = { ...newChildTemplate, id: count + 1 }; // 新しいオブジェクトを作成
      data.children.push(newChild);
      this.updateTree(); // ノード追加後にツリーを更新
      return true;
    }

    if (data.children) {
      for (const child of data.children) {
        const found = this.addChild(id, newChildTemplate, child);
        if (found) return true;
      }
    }

    return false;
  }

  moveChild(childId, newParentId) {
    // moveChild(3, 1); // IDが3の子要素をIDが1の親要素の下に移動
    let childToMove = null;

    // 子要素を見つけて削除する関数
    function removeChild(node) {
      if (!node.children) {
        return;
      }
      node.children = node.children.filter((child) => {
        if (child.id === childId) {
          childToMove = child; // 移動する子要素を保存
          return false; // 子要素を削除
        }
        removeChild(child); // 子ノードで再帰的に検索
        return true;
      });
    }

    // 新しい親要素を見つけて子要素を追加する関数
    function addChild(node) {
      if (node.id === newParentId) {
        if (!node.children) {
          node.children = [];
        }
        node.children.push(childToMove);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          const found = addChild(child);
          if (found) return true;
        }
      }
      return false;
    }

    // 子要素の削除と新しい親への追加
    removeChild(this.data);
    if (childToMove) {
      addChild(this.data);
    }
    this.offMoveMode();
    this.updateTree(); // ノード追加後にツリーを更新
  }

  removeChildById(data = this.data) {
    const idToRemove = this.selectedId;
    // 親ノードが子ノードを持っているか確認
    if (!data.children || data.children.length === 0) {
      return false;
    }

    // 指定されたIDを持つ子ノードを削除
    for (let i = 0; i < data.children.length; i++) {
      if (data.children[i].id === idToRemove) {
        data.children.splice(i, 1);
        return true; // 削除成功
      }
    }

    // 子ノードで再帰的に検索
    for (const child of data.children) {
      const found = this.removeChildById(child);
      if (found) return true; // 子ノードで削除成功
    }

    return false; // 削除対象が見つからなかった
  }

  calcFp() {
    const root = d3.hierarchy(this.data); // D3階層データの生成
    let totalPrice = 0;

    // IDが一致するノードを探し、見つかったらその子孫のpriceを合計する
    function collectPrices(node, selectedId) {
      if (node.data.id === selectedId) {
        addPrices(node);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          const found = collectPrices(child, selectedId);
          if (found) return true;
        }
      }
      return false;
    }

    // 指定されたノードとその子孫のpriceを合計する
    function addPrices(node) {
      if (node.data.detail && node.data.detail.price) {
        totalPrice += node.data.detail.price;
      }
      if (node.children) {
        node.children.forEach((child) => addPrices(child));
      }
    }
    collectPrices(root, this.selectedId);

    document.getElementById("fpPrice").textContent = totalPrice;
  }

  countIds(data) {
    /*
     * idを振る時に使用
     */
    let count = 0;

    function traverse(node) {
      if (node.id) {
        count++;
      }

      if (node.children && node.children.length > 0) {
        node.children.forEach((child) => traverse(child));
      }
    }

    traverse(data);
    return count;
  }

  findAllDescendants(root, id) {
    let descendants = [];

    // IDが一致するノードを探し、見つかったらその子孫を集める
    function collectDescendants(node) {
      if (node.data.id === id) {
        descendants.push(node);
        collectAllDescendants(node);
        return true;
      }
      if (node.children) {
        for (const child of node.children) {
          const found = collectDescendants(child);
          if (found) return true;
        }
      }
      return false;
    }

    // すべての子孫を集める
    function collectAllDescendants(node) {
      if (node.children) {
        node.children.forEach((child) => {
          descendants.push(child);
          collectAllDescendants(child);
        });
      }
    }

    collectDescendants(root);
    return descendants;
  }

  zoom(data, selectedId) {
    const root = d3.hierarchy(data); // D3階層データの生成
    const descendants = this.findAllDescendants(root, selectedId);
    const newRootData = descendants[0].data; // 選択した要素のデータ
    this.data = newRootData; // 初期化時に使用するデータを変更
    this.updateTree();
  }
}