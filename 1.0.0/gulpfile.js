var gulp = require('gulp');
var path = require('path');
var fs = require('fs');

// Plugins
//var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var minifyCSS = require('gulp-minify-css');
var wrapper = require('gulp-wrapper');
var replace = require('gulp-replace');
var fileinclude = require('gulp-file-include');
var rename = require("gulp-rename");

var gutil = require('gulp-util');   //gulp常用的工具库
var ftp = require('vinyl-ftp');    //github：https://github.com/morris/vinyl-ftp



/**
 * [projectConfig 项目设置]
 */
var projectConfig = {
    // 项目名称
    name: '项目模板',
    // 项目开发者
    author: 'xiaoxin',
    // 是否自动发布
    isAutoRelease: true,
    // 发布目录路径
    releasePath: 'member/storedValue/1.0.0',
    // 产品线路径
    productPath: 'mobile/payment/',
    // 是否自动补全 CDN路径
    isAutoPrefixCDN: true,
    // CDN路径
    cdnPath: '//static.360buyimg.com/finance/',
    //ftp信息
    ftpHost: "192.168.146.74",
    user: "www",
    pwd: "www",
    //path: "finance/consumer/baitiao/index/",
    // demo路径
    demoPath: "var/www/demo.jr.jd.com/finance/",
    // 测试服务器路径
    staticPath: "var/www/static.360buyimg.com/finance/"
};

/**
 * [projectUtil 工具类]
 */
var projectUtil = {
    // 格式化路径
    fomartPath: function(pathStr) {
        return pathStr.replace(/\\/g, '\/');
    },
    // 获取当前目录
    getCurrentDir: function() {
        return fs.realpathSync('./');
    },
    // 获取svn根目录
    getSvnRoot: function() {
        var currentDir = this.getCurrentDir();
        var svnRoot = currentDir.replace(/develop\S*/g, '');
        svnRoot = this.fomartPath(svnRoot);
        return svnRoot;
    },
    // 获取发布目录
    getReleasePath: function() {
        var svnRoot = this.getSvnRoot();
        var releasePath = projectConfig.releasePath;
        var targetPath = path.join(svnRoot, 'release', releasePath);
        return targetPath;
    },
    // 获取CDN全部路径
    getCDNpath: function() {
        var cdnPath = projectConfig.cdnPath + projectConfig.productPath + projectConfig.releasePath;
        return cdnPath;
    },
    // 获取当前时间
    getNowDate: function() {
        var nowDate = new Date();
        now = nowDate.getFullYear() + '-' + (nowDate.getMonth() + 1) + '-' + nowDate.getDate() + ' ' + nowDate.getHours() + ':' + nowDate.getMinutes() + ':' + nowDate.getMinutes();
        return now;
    },
    // 删除文件夹
    deleteDir: function(path) {
        var _this = this;
        var files = [];
        if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    _this.deleteDir(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    },
    //获取ftp配置信息
    //@param target {[String]}  目标ftp（demo、static）
    getFtpSetting: function (target){
        var ftpDest = (target == "demo"? projectConfig.demoPath : projectConfig.staticPath) + (projectConfig.productPath + projectConfig.releasePath).replace(/finance\//, "");
        return {
            host: projectConfig.ftpHost,
            user: projectConfig.user,
            pass: projectConfig.pwd,
            dest: ftpDest,
            port: 21,    //默认端口
            parallel: 10,   //并行数
            log: gutil.log
        };
    }
};

/**
 * 单步任务
 */
// sass & minifyCSS
gulp.task('sass', function() {
    gulp.src([
        'css/**/*.scss',
        '!css/**/_*.scss'
    ])
        .pipe(sass({
            includePaths: ['css']
        }))
        // .pipe(minifyCSS())
        .pipe(replace(/url\(i/g, 'url(' + project.cdnPath))
        .pipe(wrapper({
            header: '/* @update: ' + projectUtil.getNowDate() + ' */ \n'
        }))
        .pipe(gulp.dest('build/css'))
});

// css
gulp.task('css', function() {
    gulp.src([
        'css/**/*.css',
        '!css/**/*.min.css'
    ])
        .pipe(minifyCSS({
            compatibility: 'ie7'
        }))
        // .pipe(replace(/url\(i/g, 'url('+ project.cdnPath))
        .pipe(wrapper({
            header: '/* @update: ' + projectUtil.getNowDate() + ' */ \n'
        }))
        .pipe(gulp.dest('build/css'))
});

// uglify javascript
gulp.task('js', function() {
    gulp.src([
        'js/**/*.js'
    ])
        .pipe(uglify({
            mangle: {
                except: ['jQuery', '$', 'require']
            },
            output: {
                ascii_only: true
            }
        }))
        .pipe(replace(/\.\.\//, projectUtil.getCDNpath() + '/'))
        .pipe(wrapper({
            header: '/* @update: ' + projectUtil.getNowDate() + ' */ \n'
        }))
        .pipe(gulp.dest('build/js'))
});

// html
gulp.task('html', function() {
    gulp.src([
        'html/**/*.html',
        'html/**/*.htm'
    ])
        .pipe(replace(/href="..\/css/g, 'href="' + projectUtil.getCDNpath() + '/css'))
        .pipe(replace(/src="..\/js/g, 'src="' + projectUtil.getCDNpath() + '/js'))
        .pipe(replace(/src="..\/images/g, 'src="' + projectUtil.getCDNpath() + '/images'))
        .pipe(replace(/src="..\/css/g, 'src="' + projectUtil.getCDNpath() + '/css'))
        .pipe(replace(/url\(..\/images/g, 'url(' + projectUtil.getCDNpath() + '/images'))
        .pipe(replace(/lazyload="..\/images/g, 'lazyload="' + projectUtil.getCDNpath() + '/images'))
        .pipe(gulp.dest('build/html'))
});

gulp.task('moveFiles', function() {
    gulp.src([
        'css/i/*.png',
        'css/i/*.jpg',
        'css/i/*.gif'
    ])
        .pipe(gulp.dest('build/css/i'));
    gulp.src([
        'css/sprite/*.png',
        'css/sprite/*.jpg',
        'css/sprite/*.gif'
    ])
        .pipe(gulp.dest('build/css/sprite'));
    gulp.src([
        'css/slice/*.png',
        'css/slice/*.jpg',
        'css/slice/*.gif'
    ])
        .pipe(gulp.dest('build/css/slice'));
    gulp.src([
        'images/*.png',
        'images/*.jpg',
        'images/*.gif'
    ])
        .pipe(gulp.dest('build/images'));
});


// 删除build 文件夹
gulp.task('deleteBuild', function() {
    projectUtil.deleteDir('build');
});

// 发布到发布目录
gulp.task('releaseBuild', function() {
    // 删除发布目录
    projectUtil.deleteDir(projectUtil.getReleasePath());
    // 复制build至 发布目录
    gulp.src([
        'build/css/**/*.*'
    ]).pipe(gulp.dest(projectUtil.getReleasePath()+ '/css'));
    gulp.src([
        'build/js/**/*.*'
    ]).pipe(gulp.dest(projectUtil.getReleasePath()+ '/js'));
    gulp.src([
        'build/images/**/*.*'
    ]).pipe(gulp.dest(projectUtil.getReleasePath()+ '/images'));
});


// task build 打包流程
gulp.task('build', function() {
    gulp.run(['deleteBuild', 'css', 'js', 'moveFiles', 'html']);
});

// task release 发布流程
gulp.task('release', function(){
    gulp.run(['releaseBuild']);
});

// test
gulp.task('test', function() {
    console.log(path.join(project.cdnPath, project.releasePath));
});

// include TPL 支持 TPL 模板
gulp.task('fileinclude', function() {
    gulp.src(['html/template/*.tpl'])
        .pipe(fileinclude({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(rename({
            extname: ".html"
        }))
        .pipe(gulp.dest('html'));
});


var browserSync = require('browser-sync');

// Static server
gulp.task('server', function() {
    var files = [
        'html/**/*.html',
        'html/**/*.htm',
        'css/**/*.css',
        'css/i/*.*',
        'js/**/*.js'
    ];
    browserSync.init(files, {
        server: {
            baseDir: './',
            directory: true
        }
    });
});

// Static server with tpl
gulp.task('server-tpl', function() {

    gulp.run(['fileinclude']);
    gulp.watch('html/template/**/*.tpl', ['fileinclude']);

    var files = [
        'html/**/*.tpl',
        'html/**/*.html',
        'html/**/*.htm',
        'css/**/*.css',
        'css/i/*.*',
        'js/**/*.js'
    ];
    browserSync.init(files, {
        server: {
            baseDir: './',
            directory: true
        }
    });

});

//发布项目到demo和静态测试服务器上
/*
 * 部署到ftp服务器上
 * @param method {[String]}  修改方式（update：上传，remove：删除，默认update）
 * @param target {[String]}  目标ftp（demo、static， 默认static）
 * */
function deploy(method, target) {
    var ftpMethod = method || "update",
        ftpTarget = target || "static",
        ftpSetting = projectUtil.getFtpSetting(ftpTarget);
    //创建ftp链接
    var conn = ftp.create(ftpSetting);
    //目标路径
    var path = ftpSetting.dest,
        removePath = path.replace(/^var\/www\//gm, '');

    //update函数
    function upload(){
        if(ftpTarget == "demo"){
            gulp.src([
                "build/**/*.*",
                "!build/js/**/*.*",
                "!build/css/**/*.*",
                "!build/resources/**/*.*"
            ])
                .pipe(conn.dest(ftpSetting.dest))
                .on("error", function (err){
                    gutil.log("***上传错误："+err);
                })
                .on("end", function (){
                    gutil.log("***发布完成!");
                });
        }
        else if(ftpTarget == "static"){
            gulp.src([
                "build/**/*.*",
                "!build/html/**/*.*",
                "!build/data/**/*.*"
            ])
                .pipe(conn.dest(ftpSetting.dest))
                .on("error", function (err){
                    gutil.log("***上传错误："+err);
                })
                .on("end", function (){
                    gutil.log("***发布完成!");
                    //console.log(removePath);
                });
        }

    }

    //先将目标文件夹清空（定时器是因为刚删除有可能该文件夹被占用，保险起见开个定时器）
    conn.rmdir(removePath, function (){
        gutil.log("***删除完成!");
        if(ftpMethod == "update"){
            setTimeout(upload, 10);
        }
    });
}

/*
 * 发布规则
 * 压缩与发布无法做成队列形式
 * 1. build
 *   压缩：build
 *   不压缩：build-o
 * 2. 发布任务到ftp
 *     demo：
 *       ftp2demo
 *     static：
 *       ftp2static
 * */

//发布项目到demo
gulp.task("ftp2demo", function () {
    gutil.log("***开始上传");
    deploy("update", "demo");
});

//发布项目到static
gulp.task("ftp2static", function (){
    gutil.log("***开始上传");
    deploy("update", "static");
});

//一键部署
gulp.task("ftp", function (){
    gulp.run(["ftp2demo", "ftp2static"]);
});