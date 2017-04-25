import notify from './notify';
import Vue from 'vue';
import App from '../vue/App.vue';

//require('./main.css');
//require('./sass-styling.scss');
//

var app = new Vue({
     el: '#app',
     render: h => h(App),
     data: {
     message: 'Hello Vue!'
     }
});

document.addEventListener('DOMContentLoaded', (e) => {
    let test = 'test2';
    console.log('test2');
    // notify.notify('hoisdadasdasd!!!!!');
    // notify.log('test hiepasd hoid');

    $('.test').click(function(){
       console.log('test');
    });

});