var exec = require('child_process').exec;

// Hexo 3, new article and auto open it to write.
hexo.on('new', function(data){
    // mac osx下
    exec('open -a "/Applications/Sublime Text.app" ' + data.path);

    // window
    // exec('subl ' + data.path);
});