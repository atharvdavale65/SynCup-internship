import os
import json
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.tree import DecisionTreeClassifier

INTENTS_FILENAME = os.path.join(os.path.dirname(__file__), 'intents.json')
PICKLE_FILENAME = os.path.join(os.path.dirname(__file__), 'intents.pickle')

def train_model_and_save():
    with open(INTENTS_FILENAME, 'r') as intents_file:
        intents_data = json.load(intents_file)
    training_phrases = []
    labels = []

    for intent in intents_data['intents']:
        for phrase in intent['training_phrases']:
            training_phrases.append(phrase)
            labels.append(intent['name'])
 
    vectorizer = TfidfVectorizer()
    X = vectorizer.fit_transform(training_phrases)

    classifier = DecisionTreeClassifier()
    classifier.fit(X, labels)

    model_data = {'vectorizer': vectorizer, 'classifier': classifier}
    
    with open(PICKLE_FILENAME, 'wb') as pickle_file:
        pickle.dump(model_data, pickle_file)

def load_model():
    if os.path.exists(PICKLE_FILENAME):
        with open(PICKLE_FILENAME, 'rb') as pickle_file:
            model_data = pickle.load(pickle_file)
            if 'vectorizer' in model_data and 'classifier' in model_data:
                vectorizer = model_data['vectorizer']
                classifier = model_data['classifier']
                with open(INTENTS_FILENAME, 'r') as intents_file:
                    intents_data = json.load(intents_file)
                return vectorizer, classifier, intents_data
            else:
                print("Invalid model data found in the pickle file. Training model from scratch.")
                train_model_and_save()
                return load_model()
    else:
        print("Pickle file not found. Training model and saving to", PICKLE_FILENAME)
        train_model_and_save()
        return load_model()

def get_response(user_input, topic):
    vectorizer, classifier, intents_data = load_model()
    user_input_vectorized = vectorizer.transform([user_input])
    predictions = classifier.predict_proba(user_input_vectorized)[0]

    intents_probabilities = []
    for intent, prob in zip(classifier.classes_, predictions):
        intents_probabilities.append((intent, prob))

    intents_probabilities.sort(key=lambda x: x[1], reverse=True)

    relevant_intents = []
    for intent, _ in intents_probabilities:
        if topic.lower() in intent.lower():
            relevant_intents.append(intent)

    top_relevant_intent = relevant_intents[0] if relevant_intents else None

    response = None
    if top_relevant_intent:
        for data in intents_data['intents']:
            if data['name'] == top_relevant_intent:
                response = data['response']
                break

    return response
