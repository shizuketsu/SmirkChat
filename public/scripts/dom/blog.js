class Blog {
    id = 0;

    getRandomInt(min, max){
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    addBlogListPost(header) {
        const postsList = document.querySelector('.blog-headers-list');
        const li = document.createElement('li');
        li.className = 'blog-headers-item';
        postsList.appendChild(li);

        const a = document.createElement('a');
        a.href = '#blog-post_' + this.id;
        a.textContent = header;
        li.appendChild(a);
    }

    addBlogPost(header, text) {
        this.id++;

        const blogContent = document.querySelector('.blog-content');
        const post = document.createElement('div');
        post.className = 'blog-post';
        blogContent.appendChild(post);

        const blogHeader = document.createElement('h1');
        blogHeader.textContent = header;
        blogHeader.id = 'blog-post_' + this.id;
        post.appendChild(blogHeader);

        const lines = text.split(';');
        for(let i = 0; i < lines.length; i++) {
            const p = document.createElement('p');
            p.textContent = lines[i];
            post.appendChild(p);
        }

        this.addBlogListPost(header);
    }
}