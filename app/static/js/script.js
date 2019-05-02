/*jqueryを使わず、native-jsのみで実装すること*/
(function() {
  var URL_BLANK_IMAGE =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  var elDrop = document.getElementById("dropzone");
  var elImFile = document.getElementById("image-file");
  var elButton = document.getElementById("recognition");

  /*関数リテラルで関数を作成
  関数リテラルは関数名を宣言しなくて良いため、無名関数や匿名関数とも呼ばれる
  ただし、関数の巻き上げがないため、関数リテラル以降でないと実行ができない
  arrow関数に従い記述を縮小している*/
  var showDropping = () => elDrop.classList.add("dropover");

  var hideDropping = () => elDrop.classList.remove("dropover");

  var attachImage = (file, elImage) => {
    /*ユーザのコンピュータ内にあるファイルをウェブアプリケーションから
    非同期的に読み込むことが可能になる
    https://developer.mozilla.org/ja/docs/Web/API/FileReader*/
    var reader = new FileReader();
    /*データの読込が正常に完了した際にloadイベントが発生し、
    設定したコールバック関数が呼び出される
    https://lab.syncer.jp/Web/API_Interface/Reference/IDL/FileReader/onload/*/
    reader.onload = event => {
      /*ファイルの読込結果は、FileReaderオブジェクトのresultプロパティに入っています。
      つまりイベントオブジェクトのtarget（=FileReader）のresultに読込結果が入っています
      FileReader.result == event.target.result
      https://uhyohyo.net/javascript/12_5.html*/
      var src = event.target.result;
      elImage.src = src;
      elImage.setAttribute("title", file.name);
    };
    /*FileReaderオブジェクトの読み込み用メソッドはtextとArrayBuffer（バイナリ）の２つ意外に
    DataURLの特殊なURLで読み込むメソッドが用意されている
    同URLはデータがURL内部に書かれているため、URLを読むことがデータを読み込むことと同義になる
    なお、DataURLはbase64でシリアライズしたバイナリデータに所定のヘッダーを付けたもののため、
    手動で作ろうと思えば簡単に作ることができる
    そこで、よく使われるのがimg要素に画像を読み込ませる際に、src属性にDataURLを記述することで
    画像を表示することができる
    https://uhyohyo.net/javascript/12_5.html*/
    reader.readAsDataURL(file);
  };

  var buildElFile = file => {
    var elFile = document.createElement("li");
    var text = file.name + " (" + file.type + "," + file.size + "bytes)";
    elFile.appendChild(document.createTextNode(text));
    if (file.type.indexOf("image/") === 0) {
      var elImage = document.createElement("img");
      elImage.src = URL_BLANK_IMAGE;
      elFile.appendChild(elImage);
      attachImage(file, elImage);
    }
    return elFile;
  };

  /*javascriptからさまざまなイベント処理を実行するメッソド
  イベント処理とは、Webページの読込やマウスクリックなど
  https://www.sejuku.net/blog/57625*/
  /*ES2015のarrow関数に準拠*/
  elDrop.addEventListener(
    "dragover",
    event => {
      /*preventDefaultは、touchmoveやaタグリンクの動作を防ぐ処理
      https://qiita.com/tochiji/items/4e9e64cabc0a1cd7a1ae
      また、最近ではpreventDefaultを正常に使うために、イベントリスナに
      {passive: false}を設定する必要がる
      trueの場合、ブラウザ側が動作妨害をしないと判断され、無視される可能性がある*/
      /*DnD-APIのdragoverイベントは、イベントが発生するとdropEffectがnoneになるため、
      どうやらデフォルト動作を切る必要があるらしい。
      https://numb86-tech.hatenablog.com/entry/2016/04/26/145702*/
      event.preventDefault();
      /*転送データを取り扱う時のドロップ側の操作を返す
      ドラッグされる要素（effectAllowed）と、受け取る（dropEffect）が合わない場合、
      ドロップが発生しないらしいが、、、
      この場合、ドラッグされる要素はブラウザ外のファイルのため良いのか？
      https://lab.syncer.jp/Web/API_Interface/Reference/IDL/DataTransfer/dropEffect/*/
      event.dataTransfer.dropEffect = "copy";
      showDropping();
    },
    { passive: false }
  );

  elDrop.addEventListener("dragleave", event => {
    hideDropping();
  });

  elDrop.addEventListener(
    "drop",
    event => {
      event.preventDefault();
      hideDropping();
      /*転送中のファイルの一覧をFileListで返す？
      https://lab.syncer.jp/Web/API_Interface/Reference/IDL/DataTransfer/files/*/
      var files = event.dataTransfer.files;
      /*ファイル（画像）が１つであることを前提とする*/
      if (files.length != 0) {
        /*html要素の中身を変更する関数
        ""を代入することで中身を空にすることが可能
        https://techacademy.jp/magazine/15332*/
        elImFile.innerHTML = "";
        elImFile.appendChild(buildElFile(files[0]));
      } else {
        alert("Please put only one picture.");
        var files = null;
      }
    },
    { passive: false }
  );

  var escapeHtml = source => {
    var el = document.createElement("div");
    el.appendChild(document.createTextNode(source));
    /*innerHTMLでHTML要素を代入*/
    var destination = el.innerHTML;
    return destination;
  };

  /*documentsはhtml全体を指す
  https://www.sejuku.net/blog/30970*/
  document.addEventListener("click", event => {
    var elTarget = event.target;
    /*「tagName」要素名を返す
    https://developer.mozilla.org/ja/docs/Web/API/Element/tagName
    ここでは、おそらくドラッグ＆ドロップによってimg要素が追加されることで
    処理が進むようになっている
    と思ったが違った、、、
    画像が追加されることで、この画像がボタンの役割を担っている
    そして、これに反応すると新しいタブで元画像を表示している*/
    if (elTarget.tagName === "IMG") {
      var src = elTarget.src;
      /*「window.open」新規ウィンドウを開く
      第一引数のURLに「about:blank」を指定することで新規タブで開く*/
      var w = window.open("about:blank");
      var d = w.document;
      /*getAttributeでIMG要素のタイトルを取得*/
      var title = escapeHtml(elTarget.getAttribute("title"));

      d.open();
      d.write("<title>" + title + "</title>");
      d.write('<img src="' + src + '" />');
      d.close();
    }
  });

  elButton.addEventListener("click", event => {
    //console.log(elImFile.getElementsByTagName("img")[0].src);
    var elImg = elImFile.getElementsByTagName("img");
    if (elImg.length != 1) return false;
    var img = elImFile.getElementsByTagName("img")[0].src;
    img = img.replace("image/png", "image/octet-stream");
    console.log(img);

    // ajax
    // https://q-az.net/without-jquery-ajax/
    var req = new XMLHttpRequest();
    req.open("POST", "http://127.0.0.1:5000/", true);
    // content-typeを指定しないとsendでデータを送れない！
    // https://www.sejuku.net/blog/53627
    req.setRequestHeader(
      "content-type",
      "application/x-www-form-urlencoded;charset=UTF-8"
    );
    req.send("img=" + img);
    req.onreadystatechange = () => {
      if (req.readyState === 4) {
        if (req.status === 200) console.log(req.statusText);
        else console.log(req.statusText);
      }
    };
  });
})();
