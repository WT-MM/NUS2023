from flask import Flask, render_template, flash, request, redirect, jsonify

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/evaluate', methods=['POST', 'GET'])
def evaluate():
    if(request.method == 'POST'):
        appearance = int(request.form['appearance'])
        accuracy = int(request.form['accuracy'])
        image = request.form['image_id']
        save_data(image, appearance, accuracy)

    return render_template('evaluate.html')


@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404


def save_data(image, appearance, accuracy):
    if(app.debug):
        # Running locally, can save to file
        with open('../data/humanEval.csv', 'a') as f:
            f.write(f'{image},{appearance},{accuracy}\n')
    else:
        # TODO: Save to database - either firebase or google sheets? 
        pass


if __name__ == '__main__':
    app.run(debug=True)