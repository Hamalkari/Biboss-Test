const gulp = require('gulp');
const webserver = require('browser-sync').create();
const pug = require('gulp-pug');
const sass = require('gulp-sass');
const plumber = require('gulp-plumber');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const jpegrecompress = require('imagemin-jpeg-recompress');
const pngquant = require('imagemin-pngquant');
const cache = require('gulp-cache');
const rimraf = require('gulp-rimraf');
const spritesmith = require('gulp.spritesmith');
const babel = require('gulp-babel');
const rigger = require('gulp-rigger');


// Наш локальный сервер
gulp.task('webserver',function()
{
    webserver.init({
        server: {
            baseDir: 'build'
        },
        notify: false
    });
});

// сборка pug 
gulp.task('pug:build', function buildHTML() {
    return gulp.src('source/template/index.pug')
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest('build'))
    .pipe(webserver.reload({ stream: true }));
  });

// сбор стилей
gulp.task('css:build', function () {
    return gulp.src('source/styles/main.scss')// получим main.scss
        .pipe(plumber()) // для отслеживания ошибок
        .pipe(sourcemaps.init()) // инициализируем sourcemap
        .pipe(sass()) // scss -> css
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('build/css/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(cleanCSS()) // минимизируем CSS
        .pipe(sourcemaps.write('./')) // записываем sourcemap
        .pipe(gulp.dest('build/css/')) // выгружаем в build
        .pipe(webserver.reload({ stream: true }));
});


gulp.task('js:build', function () {
    return gulp.src('source/js/main.js')
        .pipe(babel({
          presets: ['@babel/env']
        })) // получим файл main.js
        .pipe(plumber())
        .pipe(rigger()) // для отслеживания ошибок
        .pipe(gulp.dest('build/js/'))
        .pipe(rename({ suffix: '.min' }))
        .pipe(sourcemaps.init()) //инициализируем sourcemap
        .pipe(uglify()) // минимизируем js
        .pipe(sourcemaps.write('./')) //  записываем sourcemap
        .pipe(gulp.dest('build/js/')) // положим готовый файл
        .pipe(webserver.reload({ stream: true })); // перезагрузим сервер
});

// перенос шрифтов
gulp.task('fonts:build', function () {
    return gulp.src('source/fonts/**/*.*')
        .pipe(gulp.dest('build/fonts/'));
});


// обработка картинок
gulp.task('image:build', function () {
    return gulp.src('source/images/**/*.*') // путь с исходниками картинок
        .pipe(cache(imagemin([ // сжатие изображений
            imagemin.gifsicle({ interlaced: true }),
            jpegrecompress({
                progressive: true,
                max: 90,
                min: 80
            }),
            pngquant(),
            imagemin.svgo({ plugins: [{ removeViewBox: false }] })
        ])))
        .pipe(gulp.dest('build/images/')); // выгрузка готовых файлов
});


// удаление каталога build 
gulp.task('clean:build', function () {
    return gulp.src('build/*', { read: false })
        .pipe(rimraf());
});


// очистка кэша
gulp.task('cache:clear', function () {
    cache.clearAll();
});

//спрайты
gulp.task('sprite:build', function(cb) {
    const spriteData = gulp.src('source/images/icons/*.png').pipe(spritesmith({
      imgName: 'sprite.png',
      imgPath: '../images/sprite.png',
      cssName: 'sprite.scss'
    }));
  
    spriteData.img.pipe(gulp.dest('build/images/'));
    spriteData.css.pipe(gulp.dest('source/styles/global/'));
    cb();
  });


// сборка
gulp.task('build',
    gulp.series('clean:build',
        gulp.parallel(
            'pug:build',
            'css:build',
            'js:build',
            'fonts:build',
            'sprite:build',
            'image:build'
        )
    )
);

// запуск задач при изменении файлов
gulp.task('watch', function () {
    gulp.watch('source/template/**/*.pug', gulp.series('pug:build'));
    gulp.watch('source/styles/**/**/*.scss', gulp.series('css:build'));
    gulp.watch('source/js/**/*.js', gulp.series('js:build'));
    gulp.watch('source/images/**/*.*', gulp.series('image:build'));
    gulp.watch('source/fonts/**/*.*', gulp.series('fonts:build'));
});


// задача по умолчанию
gulp.task('default', gulp.series(
    'build',
    gulp.parallel('webserver','watch')      
));
