/**
 * Des
 * Created by wangxiaoxin on 2018/4/28.
 * E-mail wangxiaoxin@jd.com
 * Update 2018/4/28
 */

/*通用loading遮罩及tip提示要引入components.css*/
/*加载中展示遮罩效果*/
function addLoadingMask(){
    var mask = '<div class="windowMask jm-jdloading"><span class="loading-icon"></span></div>';
    $('body').append(mask);
}
/*加载完成隐藏遮罩方法*/
function hideLoadingMask(){
    var item = $('.windowMask');
    item.addClass('fadeOut');
    setTimeout(function(){
        item.remove();
    },300);
}
/*调用方法举例*/
window.onload = function (ev) {
    addLoadingMask();
    setTimeout(function () {
        hideLoadingMask()
    },1000)
}