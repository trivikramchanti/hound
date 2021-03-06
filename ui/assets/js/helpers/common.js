export const ExpandVars = (template, values) => {
    for (let name in values) {
        template = template.replace('{' + name + '}', values[name]);
    }
    return template;
};

export const UrlToRepo = (repo, path, line, rev) => {
    if (!repo){
        // panic
        setTimeout(function(){
            document.body.innerHTML = '<h1 style="text-align:center">Something went wrong. Try to refresh page.</h1>';
        }, 100);
        throw("repo is undefined");
    }
    let url = repo.url.replace(/\.git$/, '');
    const pattern = repo['url-pattern'];
    const filename = path.substring(path.lastIndexOf('/') + 1);
    let anchor = line ? ExpandVars(pattern.anchor, { line, filename }) : '';

    // Determine if the URL passed is a GitHub wiki
    const wikiUrl = /\.wiki$/.exec(url);

    if (wikiUrl) {
        url = url.replace(/\.wiki/, '/wiki')
        path = path.replace(/\.md$/, '')
        anchor = '' // wikis do not support direct line linking
    }

    // Hacky solution to fix _some more_ of the 404's when using SSH style URLs.
    // This works for both github style URLs (git@github.com:username/Foo.git) and
    // bitbucket style URLs (ssh://hg@bitbucket.org/username/Foo).

    // Regex explained: Match either `git` or `hg` followed by an `@`.
    // Next, slurp up the hostname by reading until either a `:` or `/` is found.
    // Finally, grab all remaining characters.
    const sshParts = /(git|hg)@(.*?)(:|\/)(.*)/.exec(url);

    if (sshParts) {
        url = '//' + sshParts[2] + '/' + sshParts[4];
    }

    // I'm sure there is a nicer React/jsx way to do this:
    return ExpandVars(pattern['base-url'], {
        url,
        path,
        rev,
        anchor
    });
};
