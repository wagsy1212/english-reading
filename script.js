let data = JSON.parse(localStorage.getItem('readingData')) || {};
    let selectedFolder = null;
    let selectedArticle = null;

    const folderList = document.getElementById('folder-list');
    const articleList = document.getElementById('article-list');
    const contentView = document.getElementById('content-view');
    const contentEdit = document.getElementById('content-edit');
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    function saveData() {
      localStorage.setItem('readingData', JSON.stringify(data));
    }

    function renderFolders() {
      folderList.innerHTML = '';
      Object.keys(data).forEach(folder => {
        const li = document.createElement('li');
        li.className = folder === selectedFolder ? 'active' : '';

        const span = document.createElement('span');
        span.textContent = folder;
        span.onclick = () => {
          selectedFolder = folder;
          selectedArticle = null;
          renderFolders();
          renderArticles();
          displayContent();
        };

        const renameBtn = document.createElement('button');
        renameBtn.textContent = '✏️';
        renameBtn.onclick = (e) => {
          e.stopPropagation();
          const newName = prompt('Rename folder:', folder);
          if (newName && newName !== folder && !data[newName]) {
            data[newName] = data[folder];
            delete data[folder];
            if (selectedFolder === folder) selectedFolder = newName;
            saveData();
            renderFolders();
            renderArticles();
          }
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`Delete folder "${folder}"?`)) {
            delete data[folder];
            if (selectedFolder === folder) {
              selectedFolder = null;
              selectedArticle = null;
              displayContent();
            }
            saveData();
            renderFolders();
            renderArticles();
          }
        };

        li.appendChild(span);
        li.appendChild(renameBtn);
        li.appendChild(deleteBtn);
        folderList.appendChild(li);
      });
    }

    function renderArticles() {
      articleList.innerHTML = '';
      if (!selectedFolder) return;
      data[selectedFolder].forEach((article, index) => {
        const li = document.createElement('li');
        li.className = index === selectedArticle ? 'active' : '';

        const span = document.createElement('span');
        span.textContent = article.title;
        span.onclick = () => {
          selectedArticle = index;
          renderArticles();
          displayContent();
        };

        const renameBtn = document.createElement('button');
        renameBtn.textContent = '✏️';
        renameBtn.onclick = (e) => {
          e.stopPropagation();
          const newTitle = prompt('Rename article:', article.title);
          if (newTitle) {
            article.title = newTitle;
            saveData();
            renderArticles();
          }
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '🗑️';
        deleteBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`Delete article "${article.title}"?`)) {
            data[selectedFolder].splice(index, 1);
            selectedArticle = null;
            displayContent();
            saveData();
            renderArticles();
          }
        };

        const moveSelect = document.createElement('select');
        Object.keys(data).forEach(folder => {
          const opt = document.createElement('option');
          opt.value = folder;
          opt.textContent = folder;
          if (folder === selectedFolder) opt.selected = true;
          moveSelect.appendChild(opt);
        });
        moveSelect.onchange = (e) => {
          const target = e.target.value;
          if (target !== selectedFolder) {
            const articleToMove = data[selectedFolder].splice(index, 1)[0];
            data[target].push(articleToMove);
            selectedArticle = null;
            displayContent();
            saveData();
            renderArticles();
          }
        };

        li.appendChild(span);
        li.appendChild(renameBtn);
        li.appendChild(deleteBtn);
        li.appendChild(moveSelect);
        articleList.appendChild(li);
      });
    }

    function displayContent() {
      if (!selectedFolder || selectedArticle === null) {
        contentView.style.display = 'none';
        contentEdit.style.display = 'none';
        editBtn.style.display = 'none';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        return;
      }
      const content = data[selectedFolder][selectedArticle].content;
      contentView.innerText = content;
      contentEdit.value = content;

      contentView.style.display = 'block';
      contentEdit.style.display = 'none';
      editBtn.style.display = 'inline-block';
      saveBtn.style.display = 'none';
      cancelBtn.style.display = 'none';
    }

    editBtn.onclick = () => {
      contentView.style.display = 'none';
      contentEdit.style.display = 'block';
      editBtn.style.display = 'none';
      saveBtn.style.display = 'inline-block';
      cancelBtn.style.display = 'inline-block';
    };

    saveBtn.onclick = () => {
      const newContent = contentEdit.value;
      data[selectedFolder][selectedArticle].content = newContent;
      saveData();
      displayContent();
    };

    cancelBtn.onclick = () => {
      contentEdit.value = data[selectedFolder][selectedArticle].content;
      displayContent();
    };

    function addFolder() {
      const name = prompt('Folder name:');
      if (name && !data[name]) {
        data[name] = [];
        saveData();
        renderFolders();
      }
    }

    function addArticle() {
      if (!selectedFolder) return alert('Select a folder first.');
      const title = prompt('Article title:');
      if (title) {
        data[selectedFolder].push({ title, content: '' });
        saveData();
        renderArticles();
      }
    }

    renderFolders();
    renderArticles();
    displayContent();