//export default function(message) {
function notify (message) {
    alert(message);
}

function log (message) {
    console.log(message + ' hoihoihoi');
}

export default {
    notify,
    log
};