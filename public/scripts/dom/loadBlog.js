const b = new Blog();

$.get('./blog/blog.txt?' + b.getRandomInt(100, 999), (data) => {
    const lines = data.split('\n');
    for(let i = 0; i < lines.length; i++) {
        const params = lines[i].split('^');
        b.addBlogPost(params[0], params[1]);
    }
});