/*
    on server:

    app.post('/leaderboard', (req, res) => {
        const { name, event, score, lineup, key } = req.body;

        // Insert entry into the SQLite database
        const sql = `INSERT INTO leaderboard (name, event, score, lineup, key) VALUES (?, ?, ?, ?, ?)`;
        db.run(sql, [name, event, score, JSON.stringify(lineup), key], function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.sendStatus(201); // Entry added successfully
        });
    });
*/

function hex(buffer) {
    const hexCodes = [];
    const view = new DataView(buffer);
    for (let i = 0; i < view.byteLength; i += 4) {
        const value = view.getUint32(i)
        const stringValue = value.toString(16)
        const padding = '00000000'
        const paddedValue = (padding + stringValue).slice(-padding.length)
        hexCodes.push(paddedValue);
    }
    return hexCodes.join("");
}

function sha256(string){
    var buffer = new TextEncoder("utf-8").encode(string)
    return crypto.subtle.digest("SHA-256", buffer).then(hash => {
        return hex(hash)
    })
}

async function submitLineup(){
    // use sweetalert to prompt the user for their name
    const { value: name } = await Swal.fire({
        title: 'Enter your name',
        input: 'text',
        inputPlaceholder: 'Enter your name',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) {
                return 'You need to enter your name!'
            }
        }
    })

    var [assignment, totalPowerpoints] = getCurrentAssignment();

    var event = TEAM_NAME;
    var score = totalPowerpoints;
    var lineup = assignment;

    // key is the sha256 hash of name + event + score + lineup
    const keyComponents = name + event + score + JSON.stringify(lineup);
    const key = await sha256(keyComponents);

    // POST request to the server
    const response = await fetch(HOST+'/leaderboard', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, event, score, lineup, key })
    });

    // if the response is successful, show a success message, otherwise show an error message
    if (response.ok) {
        Swal.fire({
            title: 'Success!',
            text: 'Your lineup has been submitted successfully.',
            icon: 'success'
        });
    } else {
        Swal.fire({
            title: 'Error!',
            text: 'An error occurred while submitting your lineup.',
            icon: 'error'
        });
    }
}