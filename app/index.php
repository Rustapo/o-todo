<?php

    require(__DIR__.'/api/functions.php');
        
    if(!loggedIn()) {
        header('Location: login.php');
        die();
    }

    if(isset($_POST['new-api-key'])) {

        require(__DIR__.'/api/initdb.php');

        session_start();

        $new_API_key = generateRandomString(25);

        $stmt = $con->prepare("UPDATE `users` SET `api_key`=? WHERE `username`=? AND `api_key`=?");
        $stmt->bind_param('sss', $new_API_key, $_COOKIE['username'], $_COOKIE['api_key']);
        $stmt->execute();

        if($stmt->error) {

            header('Location: index.php?modal=profile&message=Unable to update API Key.');

        } else {

            header('Location: login.php?message=API Key reset.');

        }

        $stmt->close();
        $con->close();

    }

?>

<!DOCTYPE html>
<html lang="en">
    <head>
        <title><?php echo $_COOKIE['username']; ?> | o-todo</title>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#ffcc00" />
        <meta name="mobile-web-app-capable" content="yes">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link href="assets/css/main.min.css" rel="stylesheet" />
        <link href="assets/css/font-awesome.min.css" rel="stylesheet" />
        <link rel="shortcut icon" href="assets/icons/icon-96.png" />
        <link rel="manifest" href="manifest.json" />
        <script src="assets/main.min.js"></script>
    </head>
    <body>

        <!-- Top navigation -->
        <nav>
            <div id="menu-button" class="header nav-button"><i class="fa fa-bars" aria-hidden="true"></i></div>
            <h1 class="title">o-ToDo</h1>
            <div class="header nav-button add-note-button"><i class="fa fa-plus" aria-hidden="true"></i></div>
        </nav>

        <!-- Main section -->
        <main id="main">

            <h1>Your ToDo-list</h1>

            <!-- Scoll list -->
            <section id="list">
                <div id="hint">
                    <h3 id="hint-title">Add a note</h3>
                    <p id="hint-body">Click the <i class="fa fa-plus" aria-hidden="true"></i> icon at the top of the screen or via the sidemenu.</p>
                </div>
                <!-- Notes! -->
            </section>

        </main>
        
        <!-- Side nav -->
        <aside id="side-menu">

            <div class="top">
                <figure>
                    <img src="assets/images/profile_img.png" alt="Profile image"/>
                    <figcaption><?php echo $_COOKIE['username']; ?></figcaption>
                </figure>
            </div>

            <ul>
                <li class="add-note-button"><i class="fa fa-plus" aria-hidden="true"></i> <span>Add note</span></li>
                <li id="refresh"><i class="fa fa-refresh" aria-hidden="true"></i> <span>Reload</span></li>
                <li id="profile-button"><i class="fa fa-user-circle-o" aria-hidden="true"></i> <span>Profile</span></li>
                <?php if($_SESSION['isAdmin']) {
                    echo '<li id="admin-button"><i class="fa fa-wrench" aria-hidden="true"></i> <span>Admin settings</span></li>';
                } ?>
                <li id="logout-button"><i class="fa fa-sign-out" aria-hidden="true"></i> <span>Log out</span></li>
            </ul>

            <!-- Footer -->
            <footer>
                <?php echo info('author'); ?> &copy; <?php echo date('Y'); ?> <span id="version">v<?php echo info('version'); ?></span><br>
                Please contribute on <a href="<?php echo info('project_url'); ?>" target="_blank" class="contribute">GitHub</a>!
            </footer>

        </aside>

        <div id="timed-status">
            <span id="timed-status-text"></span>
        </div>
        <div id="timed-status-bar"></div>

        <!-- Displayed if JavaScript is disabled. -->
        <noscript>
            <div class="container">
                <div class="inner">
                    <h1>JavaScript is required!</h1>
                    <p>This application/site requires JavaScript to function properly.</p>
                </div>
            </div>
        </noscript>

        <!-- Add note-->
        <div class="modal" id="add-note">
            <div class="inner">
                <i class="fa fa-close close-modal" aria-hidden="true"></i>
                <h1>Add note</h1><br>
                <form>
                    <label for="new-note-title">Title</label>
                    <input type="text" id="new-note-title">
                    <label for="new-note-body">Note</label>
                    <textarea id="new-note-body" style="height: 80px;"></textarea>
                    <label for="new-note-due-date">Due date</label>
                    <input type="date" id="new-note-due-date">
                    <label for="new-note-importance">Importance</label>
                    <input type="number" id="new-note-importance" min="0" value="0" max="100">
                    <input type="date" id="new-note-create-date" class="hidden" />
                    <button type="button" class="clear" id="new-note-submit" style="margin:auto;display:block;">Add note</button>
                    <p class="message"></p>
                </form>
            </div>
        </div>

        <!-- Edit note-->
        <div class="modal" id="edit-note">
            <div class="inner">
                <i class="fa fa-close close-modal" aria-hidden="true"></i>
                <h1>Edit note</h1><br>
                <form>
                    <label for="edit-note-title">Title</label>
                    <input type="text" name="edit-note-title" id="edit-note-title">
                    <label for="edit-note-note">Note</label>
                    <textarea name="edit-note-note" id="edit-note-note" style="height: 80px;"></textarea>
                    <label for="edit-note-due-date">Due date</label>
                    <input type="date" name="edit-note-due-date" id="edit-note-due-date">
                    <label for="edit-note-importance">Importance</label>
                    <input type="number" name="edit-note-importance" id="edit-note-importance" min="0" value="0" max="100">
                    <input type="text" name="edit-note-id" id="edit-note-id" class="hidden">
                    <button class="clear" type="button" id="edit-note-done">Mark as done</button>
                    <button class="clear" type="button" id="edit-note-update">Update note</button>
                    <p class="message"></p>
                </form>
            </div>
        </div>

        <!-- Profile -->
        <div class="modal" id="profile">
            <div class="inner">
                <i class="fa fa-close close-modal" aria-hidden="true"></i>
                <h1>Profile</h1><br>
                <figure>
                    <img src="assets/images/profile_img.png" alt="Profile image"/>
                    <figcaption><?php echo $_COOKIE['username']; ?></figcaption>
                </figure>
                <form method="post" action="<?php echo $_SERVER['PHP_SELF']; ?>">
                    <label for="api-key">API Key</label>
                    <input type="text" id="api-key" readonly="readonly" value="<?php echo $_COOKIE['api_key']; ?>">
                    <button type="submit" class="clear" name="new-api-key">Reset API Key</button>
                    <p class="reset-api-key">Clicking 'Reset API Key' will sign you out from every device.</p>
                    <p class="message"></p>
                </form>
            </div>
        </div>

        <?php if($_SESSION['isAdmin']) { require(__DIR__.'/include/admin.php'); }?>

    </body>
</html>
