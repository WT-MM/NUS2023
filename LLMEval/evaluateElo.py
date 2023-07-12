from collections import defaultdict
from time import strptime
from tqdm import tqdm
import numpy as np
from loadFirestore import *
import pandas as pd
import plotly.express as px



data = exportData(wantedCollection="test")

'''
data format
{'test': {241231:{'winner':2, 'loser':2, 'timestamp':2, 'prompt':2}, 513123:{}, ...}}
'''

matches = pd.DataFrame.from_dict(data["test"], orient="index").sort_values(ascending=True, by=["timestamp"])


def num_matches():
    fig = px.bar(pd.concat([matches["winner"], matches["loser"]]).value_counts(),
                title="Match Count for Each Model", text_auto=True)
    fig.update_layout(xaxis_title="model", yaxis_title="Match Count",
                    showlegend=False)
    return fig

def compute_proportional_wins(matches):

    # Count the number of matches played by each model
    matches_played = pd.concat([matches['winner'], matches['loser']]).value_counts().reset_index()
    matches_played.columns = ['Model', 'MatchesPlayed']

    # Calculate the number of matches won by each model
    win_counts = matches['winner'].value_counts().reset_index()
    win_counts.columns = ['Model', 'WinCount']

    # Merge the matches played and win counts DataFrames
    result = pd.merge(matches_played, win_counts, on='Model', how='left')

    # Calculate the win proportion
    result['WinProportion'] = result['WinCount'] / result['MatchesPlayed']
    return result

def proportional_wins(matches):
    tempWin = compute_proportional_wins(matches)
    winResults = tempWin[["WinProportion"]].set_index(tempWin["Model"])
    fig = px.bar(winResults.sort_values(ascending=False, by=["WinProportion"]), title="Win Rate for Each Model")

    fig.update_layout(xaxis_title="Model", yaxis_title="Win Rate")
    return fig

def compute_elo(matches, K=32, SCALE=400, BASE=10, INIT_RATING=1000):
    rating = defaultdict(lambda: INIT_RATING)

    for rd, winner, loser in matches[['winner', 'loser']].itertuples():
        rw = rating[winner]
        rl = rating[loser]

        winProb = 1 / (1 + BASE ** ((rl - rw) / SCALE))
        loseProb = 1 / (1 + BASE ** ((rw - rl) / SCALE))

        rating[winner] += K * (1-winProb)
        rating[loser] += K * (0-loseProb)

    return rating

def predict_win_rate(elo_ratings, K=32, SCALE=400, BASE=10, INIT_RATING=1000):
    names = sorted(list(elo_ratings.keys()))
    wins = defaultdict(lambda: defaultdict(lambda: 0))
    for a in names:
        for b in names:
            ea = 1 / (1 + BASE ** ((elo_ratings[b] - elo_ratings[a]) / SCALE))
            wins[a][b] = ea
            wins[b][a] = 1 - ea

    data = {
        a: [wins[a][b] if a != b else np.NAN for b in names]
        for a in names
    }

    df = pd.DataFrame(data, index=names)
    df.index.name = "winner"
    df.columns.name = "loser"
    return df.T

def win_rate_matchup(matches):
    win_rate = predict_win_rate(compute_elo(matches))
    ordered_models = win_rate.mean(axis=1).sort_values(ascending=False).index
    fig = px.imshow(win_rate.loc[ordered_models, ordered_models],
                    color_continuous_scale='RdBu', text_auto=".2f",
                    title="Predicted Probability Using Elo Ratings for Each Matchup")
    fig.update_layout(xaxis_title="Loser",
                    yaxis_title="Winner",
                    xaxis_side="top",
                    title_y=0.07, title_x=0.5)
    fig.update_traces(hovertemplate=
                    "Winner: %{y}<br>Loser: %{x}<br>Probability: %{z}<extra></extra>")
    return fig

def visualize_elo_scores(scores, title):
    df = pd.DataFrame([
    [n, scores[n]] for n in scores.keys()], columns=["Model", "Elo rating"]).sort_values("Elo rating", ascending=False).reset_index(drop=True)
    df["Elo rating"] = df["Elo rating"].astype(int)
    df.set_index("Model", inplace=True)
    fig = px.bar(df.sort_values(by="Elo rating", ascending=False), title=title)
    fig.update_layout(xaxis_title="Model", yaxis_title="Rating")
    return fig

def visualize_bootstrap_scores(df, title):
    bars = pd.DataFrame(dict(
        lower = df.quantile(.025),
        rating = df.quantile(.5),
        upper = df.quantile(.975))).reset_index(names="model").sort_values("rating", ascending=False)
    bars['error_y'] = bars['upper'] - bars["rating"]
    bars['error_y_minus'] = bars['rating'] - bars["lower"]
    bars['rating_rounded'] = np.round(bars['rating'], 2)
    fig = px.scatter(bars, x="model", y="rating", error_y="error_y",
                      error_y_minus="error_y_minus", text="rating_rounded",
                      title=title)
    fig.update_layout(xaxis_title="Model", yaxis_title="Rating")
    return fig


def get_bootstrap_result(battles, func_compute_elo, num_round):
    rows = []
    for i in tqdm(range(num_round), desc="bootstrap"):
        rows.append(func_compute_elo(battles.sample(frac=1.0, replace=True)))
    df = pd.DataFrame(rows)
    return df[df.median().sort_values(ascending=False).index]

def sample_battle_even(matches, n_per_match):
    groups = matches.groupby(["winner", "loser"], as_index=False)
    resampled = (groups
                 .apply(lambda grp: grp.sample(n_per_match, replace=True))
                 .reset_index(drop=True))
    return resampled

# Sampling Battles Evenly
def get_bootstrap_even_sample(battles, n_per_battle, func_compute_elo, num_round=1000):
    rows = []
    for n in tqdm(range(num_round), desc="sampling battles evenly"):
        resampled = sample_battle_even(battles, n_per_battle)
        rows.append(func_compute_elo(resampled))
    df = pd.DataFrame(rows)
    return df[df.median().sort_values(ascending=False).index]

num_samples = 50
print("number of samples per battle pair:", num_samples)
bootstrap_even_lu = get_bootstrap_even_sample(matches, num_samples, compute_elo)

BOOTSTRAP_ROUNDS = 1000

bootstrap_elo_lu = get_bootstrap_result(matches, compute_elo, BOOTSTRAP_ROUNDS)
bootstrap_lu_median = bootstrap_elo_lu.median().reset_index().set_axis(["model", "rating"], axis=1)

bootstrapsample = visualize_bootstrap_scores(bootstrap_even_lu, f"Bootstrap of Elo Estimates - Even sample")
bootstrap = visualize_bootstrap_scores(bootstrap_elo_lu, f"Bootstrap of Elo Estimates - All battles")

winRate = win_rate_matchup(matches)
numMatches = num_matches()
straightElo = visualize_elo_scores(compute_elo(matches), "Elo Scores (Linear)")
proportionalWin = proportional_wins(matches)


#bootstrapsample.write_html("./elo-interface/public/plots/bootstrapsample.html", include_plotlyjs="cdn", full_html=False)
bootstrap.write_html("./elo-interface/public/plots/bootstrap.html", include_plotlyjs="cdn", full_html=False)
winRate.write_html("./elo-interface/public/plots/winRate.html", include_plotlyjs="cdn", full_html=False)
numMatches.write_html("./elo-interface/public/plots/numMatches.html", include_plotlyjs="cdn", full_html=False)
straightElo.write_html("./elo-interface/public/plots/straightElo.html", include_plotlyjs="cdn", full_html=False)
proportionalWin.write_html("./elo-interface/public/plots/proportionalWin.html", include_plotlyjs="cdn", full_html=False)