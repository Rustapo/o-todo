/**
 *  o-todo
 *  https://github.com/olback/o-todo
 *
 */

const api_url = 'api/api.php';

const log = console.log;
const current_year = new Date().getFullYear();

let side_menu;
let messages;
let article_ids = [];

window.onload = () => {

    const year_elements = document.getElementsByClassName('current-year');
    side_menu = document.getElementById('side-menu');
    messages = document.getElementsByClassName('message');
    const list = document.getElementById('list');
    const body = document.getElementsByTagName('body');

    // Open menu.
    document.getElementById('menu-button').onclick = () => {

        side_menu.style.width = '300px';

    }

    // Close meny when clicking outside.
    document.getElementById('main').onclick = () => {

        side_menu.style.width = 0;

    }

    // Let the user use the scroll wheel to scroll sideways.
    list.onwheel = (e) => {
        
        side_menu.style.width = 0;

        if(e.deltaY > 0) {

            list.scrollBy(e.deltaY, 0);

        } else {

            list.scrollBy(e.deltaY, 0);

        }

    }

    // When scrolling, close the nav.
    list.onscroll = () => {

        side_menu.style.width = 0;

    }

    // Close sidenav when 'swipe-closing'.
    let s_txs;
    side_menu.ontouchstart = (e) => {

        s_txs = e.touches[0].clientX;

    }

    side_menu.ontouchmove = (e) => {

        if(s_txs - e.touches[0].clientX > 50) {
            side_menu.style.width = 0;
        }

    }

    // Open sidenav on swipe from the left edge.
    let b_txs;
    body[0].ontouchstart = (e) => {

        b_txs = e.touches[0].clientX;

    }

    // Close sidenav on swipe.
    body[0].ontouchmove = (e) => {

        if(b_txs <= 50 && (e.touches[0].clientX - b_txs) > 50) {

            side_menu.style.width = '300px';

        }

    }

    // Close modal when clicking the X
    const modal_close_buttons = document.getElementsByClassName('close-modal');
    for(let i = 0; i < modal_close_buttons.length; i++) {

        modal_close_buttons[i].onclick = (e) => {

            let modal = modal_close_buttons[i].parentElement.parentElement;
            modal.style.display = 'none';

        }

    }

    // Add note button action
    const add_note_buttons = document.getElementsByClassName('add-note-button');
    for(let i = 0; i < add_note_buttons.length; i++) {
        add_note_buttons[i].onclick = () => {
            openModal('add-note');
        }
    }

    document.getElementById('profile-button').onclick = () => {
        openModal('profile');
    }

    document.getElementsByTagName('figure')[0].onclick = () => {
        openModal('profile');
    }

    document.getElementById('logout-button').onclick = () => {
        window.location = 'login.php';
    }

    // Click to copy API Key
    const api_key = document.getElementById('api-key');
    api_key.onclick = () => {
        api_key.select();
        document.execCommand('copy');
    }

    document.getElementById('refresh').onclick = () => {
        //window.location.reload();
        fetchNotes();
        side_menu.style.width = 0;
    }

    document.getElementById('new-note-submit').onclick = () => {

        document.getElementById('new-note-create-date').valueAsDate = new Date();
        let body = 'new-note=1&new-note-title='+document.getElementById('new-note-title').value+'&new-note-body='+document.getElementById('new-note-body').value+'&new-note-due-date='+document.getElementById('new-note-due-date').value+'&new-note-importance='+document.getElementById('new-note-importance').value+'&new-note-create-date='+document.getElementById('new-note-create-date').value;

        fetch(api_url, {
            method: 'post',
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: 'include',
            body: body
        })
        .then(json)
        .then(function (data) {
            //log('Request succeeded with JSON response', data);
            if(!data.error) {
                
                fetchNotes();
                document.getElementById('add-note').style.display = 'none';
                document.getElementById('new-note-title').value = '';
                document.getElementById('new-note-body').value = '';
                document.getElementById('new-note-due-date').value = '';
                document.getElementById('new-note-importance').value = '0';
                setMessages('');
                showStatus('Added note.', 'ok');
                log('Success. Added note to list.');
    
            } else if(data.error) {
                
                setMessages(data.message);
                showStatus('Failed to add note.', 'danger');
    
            }
        })
        .catch(function (error) {
            log('Request failed', error);
            setMessages('Failed to add note to database.');
            showHint('Error', error, true);
            showStatus('Failed to add note.', 'danger');
        });
    
    }

    if(getParameterByName('modal')) {

        if(getParameterByName('message')) {
            setMessages(getParameterByName('message'));
            openModal(getParameterByName('modal'), true);
        } else {
            openModal(getParameterByName('modal'));
        }

    }

    fetchNotes();

} // End window.onload

// Function name says it all.
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
    if(!results) return null;
    if(!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function openModal(m, km) {

    side_menu.style.width = 0;
    document.getElementById(m).style.display = 'block';
    if(!km) {
        for(let i = 0; i < messages.length; i++) {
            messages[i].innerHTML = '';
        }
    }

}

function handleNoteActions() {

    const articles = document.getElementsByTagName('article');

    for(let i = 0; i < articles.length; i++) {

        articles[i].onclick = (e) => {

            openModal('edit-note');
            document.getElementById('edit-note-title').value = articles[i].getAttribute('title');
            document.getElementById('edit-note-note').innerText = articles[i].getAttribute('note');
            document.getElementById('edit-note-note').value = articles[i].getAttribute('note');
            document.getElementById('edit-note-due-date').value = articles[i].getAttribute('due');
            document.getElementById('edit-note-importance').value = articles[i].getAttribute('importance');
            document.getElementById('edit-note-id').value = articles[i].getAttribute('note-id');
            document.getElementById('edit-note-done').onclick = () => {
                noteDone(articles[i]);
            }
            document.getElementById('edit-note-update').onclick = () => {
                updateNote(articles[i]);
            }

        }

        let a_pos_y;
        articles[i].ontouchstart = (e) => {
            
            a_pos_y = e.touches[0].clientY;

        }

        articles[i].ontouchmove = (e) => {

            let diff = a_pos_y - e.touches[0].clientY;

            if(diff > 125) {

                noteDone(articles[i]);

            }
        }

    }

}

// Show hint when there are no articles
function showHint(title, body, isError) {
    let cn = list.childNodes;
    for(let i = 0; i < cn.length; i++) {
        if(cn[i].nodeName == 'ARTICLE') {
            if(cn[i].style.display != 'none') {
                document.getElementById('hint').style.display = 'none';
                break;
            }
        } else {
            document.getElementById('hint').style.display = 'block';
            if(title && body) {
                document.getElementById('hint-title').innerHTML = title;
                document.getElementById('hint-body').innerHTML = body;
                if(isError) {
                    document.getElementById('hint-title').style.color = 'red';
                } else {
                    document.getElementById('hint-title').style.color = 'initial';
                }
            }
        }
    }
}

// Handle the noteDone action.
function noteDone(article) {

    if(article) {

        for(let i = 0; i < article_ids.length; i++) {

            if(article.getAttribute('note-id') == article_ids[i]) {

                let temp_id = article_ids[i];
                log('Removing note with id ' + temp_id);


                fetch(api_url, {
                    method: 'delete',
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
                    },
                    credentials: 'include',
                    body: 'note-id='+temp_id
                })
                .then(json)
                .then(function (data) {
                    //log('Request succeeded with JSON response', data);
                    if(!data.error) {
                        
                        fetchNotes();
                        log('Success. Removed note.');
                        showStatus('Removed note.', 'ok');
                        article.style.opacity = '0';
                        document.getElementById('edit-note').style.display = 'none';

                    } else if(data.error) {
                        
                        log('Failed to remove note');
                        showStatus('Failed to remove note.', 'danger');
                        setMessages(data.message);
            
                    }
                })
                .catch(function (error) {
                    console.log('Request failed', error);
                    setMessages('Failed to remove note from database.');
                    showStatus('Failed to remove note.', 'danger');
                    showHint('Error', error, true);
                });

                article_ids.splice(i, 1); // Should prbably only be run on success, but for some reason that does not seem to work.

            }

        }

        setTimeout(() => {
            article.style.display = 'none';
            showHint();
        }, 300);

    }

}

function updateNote(article) {

    if(article) {

        let note_id = article.getAttribute('note-id');
        let putBody = 'update-note=1&updated-note-title='+document.getElementById('edit-note-title').value+'&updated-note-body='+document.getElementById('edit-note-note').value+'&updated-note-due-date='+document.getElementById('edit-note-due-date').value+'&updated-note-importance='+document.getElementById('edit-note-importance').value+'&note-id='+note_id;

        fetch(api_url, {
            method: 'put',
            headers: {
                "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            credentials: 'include',
            body: putBody
        })
        .then(json)
        .then(function (data) {
            //log('Request succeeded with JSON response', data);
            if(!data.error) {
                
                fetchNotes();
                log('Success. Updated note.');
                showStatus('Updated note.', 'ok');
                document.getElementById('edit-note').style.display = 'none';

            } else if(data.error) {
                
                log('Failed to update note');
                setMessages(data.message);
                showStatus('Failed to update note.', 'danger');
    
            }
        })
        .catch(function (error) {
            log('Request failed', error);
            setMessages('Failed to update note.');
            showStatus('Failed to update note.', 'danger');
            showHint('Error', error, true);
        });

    }

}

function setMessages(m) {
    for(let i = 0; i < messages.length; i++) {
        messages[i].innerHTML = m;
    }
}

function showStatus(message, color) {

    const timed_status = document.getElementById('timed-status');
    const timed_status_bar = document.getElementById('timed-status-bar');
    const timed_status_text = document.getElementById('timed-status-text');

    let bgColor;

    switch(color) {
        case 'ok':
            bgColor = '#4CAF50';
            break;

        case 'warn':
            bgColor = '#f0ad4e';
            break;

        case 'danger':
            bgColor = '#d9534f';
            break;
        
        default:
            bgColor = '#0275d8';
    }

    document.getElementById('timed-status-text').innerHTML = message;

    timed_status.style.backgroundColor = bgColor;
    timed_status.style.bottom = '0';
    timed_status_bar.style.transition = 'width 4s';
    timed_status_bar.style.transitionTimingFunction = 'linear';
    timed_status_bar.style.width = '0';
    timed_status_bar.style.zIndex = '51';

    setTimeout(() => {
        timed_status.style.bottom = '-40px';
        timed_status_bar.style.transition = 'none';
        timed_status_bar.style.width = '100%';
        timed_status_bar.style.zIndex = '-1';
    }, 4000);

}


function json(response) {

    if(response.status == 200) {

        return response.json();

    } else {

        log(response.status + ' ' + response.statusText);

        return {
            HTTP_STATUS: response.status,
            HTTP_STATUS_TEXT: response.statusText,
            title: "Error",
            message: "Server responded with HTTP satus:<br>" + response.status + " " + response.statusText,
            error: true
        };

    }

}

function fetchNotes() {

    // First remove all existing notes.
    let oldArticles = document.getElementsByTagName('article');
    for(let i = oldArticles.length-1; i >= 0; i--) {
        oldArticles[i].remove();
    }

    fetch(api_url+'?action=list', {
        method: 'get',
        headers: {
            "Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
        },
        credentials: 'include'
    })
    .then(json)
    .then(function(data) {

        //log('Request succeeded with JSON response', data);
        if(!data.error && data.notes) {

            article_ids = [];

            for(let i = 0; i < data.notes.length; i++) {

                let article = document.createElement('article');
                let h3 = document.createElement('h3');
                let p = document.createElement('p');
                let span = document.createElement('span');
                h3.innerHTML = data.notes[i].title;
                p.innerHTML = data.notes[i].body;
                span.innerHTML = data.notes[i].due;
                article.appendChild(h3);
                article.appendChild(p);
                article.appendChild(span);

                article.setAttribute("title", data.notes[i].title);
                article.setAttribute("note", data.notes[i].body);
                article.setAttribute("due", data.notes[i].due);
                article.setAttribute("note-id", data.notes[i].id);
                article.setAttribute("created", data.notes[i].created);
                article.setAttribute("importance", data.notes[i].importance);

                if(new Date(data.notes[i].due).getTime() - new Date().getTime() < 0) {
                    span.style.color = '#cc0018';
                }
        
                list.appendChild(article);

                article_ids.push(data.notes[i].id);

                handleNoteActions();

            }

            showHint('Add a note', 'Click the <i class="fa fa-plus" aria-hidden="true"></i> icon at the top of the screen or via the sidemenu.');

        } else if(data.error) {

            showHint(data.title, data.message, true);
            showStatus('Failed to refresh notes.', 'danger');

        }

    })
    .catch(function (error) {
        log('Request failed', error);
        showHint('Error', error, true);
        showStatus('Failed to refresh notes.', 'danger');
    });

}

// Register service worker
if ('serviceWorker' in navigator) {

    navigator.serviceWorker.register('service-worker.js').then(() => {
        log('Service-worker registerd');
    })

} else {

    console.error('Service-workers not supported.');

}
