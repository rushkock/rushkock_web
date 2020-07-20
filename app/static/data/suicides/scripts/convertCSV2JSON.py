#!/usr/bin/env python
# Name: Ruchella Kock
# Student number: 12460796
"""
This script transforms the world suicide data from csv file to a JSON file
For the pooled data uncomment line 30 before use
"""
import pandas as pd


def main():
    # read csv into datframe
    df = pd.read_csv("../csv/who_suicide_statistics.csv")

    # remove rows with empty cells
    df = df.dropna(axis=0)

    # make sure all groups (a group is filtered by country and year e.g.
    # all values with albania and 1995) have a sum that is bigger than 0
    df["suicides_per_10000"] = df["population"]/10000
    df["suicides_per_10000"] = df["suicides_no"]/df["suicides_per_10000"]

    df["percentage_suicides"] = df["suicides_no"]/df["population"]*100
    grouped_df = df.groupby(by=["country", "year"], as_index=False).filter(
                            lambda x: x["suicides_no"].sum() > 0)

    # get the sum of the groups:
    # note line 30 should be uncommented to make the pooledData json file
    # grouped_df = df.groupby(by=["country", "year"], as_index=False).sum()

    # transform df to json
    grouped_df.to_json(path_or_buf="json/suicide.json", orient="records")


if __name__ == '__main__':
    main()
