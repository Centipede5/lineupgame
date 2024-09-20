const TEAM_NAME = 'Princeton'

// get leaderboard/TEAM_NAME from server and display it in a table

async function getLeaderboard(){
    const response = await fetch('/leaderboard/'+TEAM_NAME)
    const data = await response.json()

    var table = document.createElement('table')
    table.className = "table table-bordered"
    var thead = document.createElement('thead')
    var tbody = document.createElement('tbody')
    table.appendChild(thead)
    table.appendChild(tbody)

    // create header row
    var tr = document.createElement('tr')
    thead.appendChild(tr)
    var headers = ['Name', 'Score']
    headers.forEach(header => {
        var th = document.createElement('th')
        th.innerHTML = header
        tr.appendChild(th)
    })

    // create rows
    data.forEach(row => {
        var tr = document.createElement('tr')
        tbody.appendChild(tr)
        var td = document.createElement('td')
        td.innerHTML = row['name']
        tr.appendChild(td)
        var td = document.createElement('td')
        td.innerHTML = row['score']
        tr.appendChild(td)
    })

    document.body.appendChild(table)
}

async function main(){
    await getLeaderboard()
}

main()