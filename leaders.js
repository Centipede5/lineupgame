const TEAM_NAME = 'Westfield'

// get leaderboard/TEAM_NAME from server and display it in a table

async function getLeaderboard(){
    const response = await fetch(HOST+'/leaderboard/'+TEAM_NAME)
    const data = await response.json();
    /*
        Add the following data:
        Heuristic Lineup: 4509
        Coaches Best Lineup: 4668
    */
    data.push({name: 'Coaches Best Lineup', score: 4668,color: 'bg-warning'})
    data.push({name: 'Heuristic Lineup', score: 4509,color: 'bg-info'})


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
        if(row['color']){
            td.className = row['color']
        }
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