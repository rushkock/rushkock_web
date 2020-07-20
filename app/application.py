from flask import Flask, render_template
app = Flask(__name__)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/thesis')
def thesis():
    return render_template('thesis.html')

@app.route('/computer_vision')
def computer_vision():
    return render_template('computer_vision.html')

@app.route('/dashboards')
def dashboards():
    return render_template('dashboards.html')

@app.route('/animation')
def animation():
    return render_template('animation.html')

@app.route("/terrorism")
def terrorism():
    return render_template("terrorism.html", visualizations=True)

##########################################################################
############################# Suicides ###################################
##########################################################################

@app.route("/suicides")
def suicides():
    return render_template("visualizations.html")

@app.route("/sources")
def sources():
    return render_template("sources.html")

@app.route("/us")
def us():
    return render_template("us.html")

@app.route("/home_suicides")
def home_suicides():
    return render_template("home_suicides.html")
