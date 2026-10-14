function initAvatar(user) {
    const avatarShortcut = getAvatarShortcut(user);
    avatarExport(avatarShortcut);
}


function getAvatarShortcut(user) {
    const avatarNameParts = user.name.trim().split(/\s+/);
    const shortcut =
        avatarNameParts.length > 1
            ? avatarNameParts[0][0] + avatarNameParts[1][0]
            : avatarNameParts[0][0];
    return shortcut.toUpperCase();
}


function avatarExport(avatarShortcut) {
    document.getElementById("avatarShortcut").innerText = avatarShortcut;
}
