export class Modal {
    constructor(elementId) {
      this.modal = document.getElementById(elementId);
      this.setupListeners();
    }
    setupListeners() {
        document.addEventListener("nodeClick", (event) => {
            this.open();
            this.createModalContents(event.detail);
        });
    }
    open() {
      this.modal.classList.add("open");
    }
    close() {
      this.modal.classList.remove('open');
    }
    createModalContents(dataList) {
        // 初期化
        if(this.modal.hasChildNodes()) {
            document.querySelectorAll('#modal p').forEach((e) => {
                e.remove();
            });
        }
        for (const key in dataList) {
            // 新しいHTML要素を作成
            let new_element = document.createElement('p');
            new_element.textContent = `${key}: ${dataList[key]}`;
            this.modal.appendChild(new_element)
        }
    }
}