"""Shared fixtures for EDA validation tests.

Loads raw CSVs once per session so all tests share the same dataframes.
"""
import pandas as pd
import pytest
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "Case Study - Data"


@pytest.fixture(scope="session")
def claims_df():
    """Raw claims dataframe with parsed dates."""
    df = pd.read_csv(DATA_DIR / "Claims_Export.csv", sep="~", encoding="utf-8-sig")
    df["DATE"] = pd.to_datetime(df["DATE_FILLED"], format="%Y%m%d")
    df["MONTH"] = df["DATE"].dt.month
    return df


@pytest.fixture(scope="session")
def drugs_df():
    """Raw drug_info dataframe."""
    return pd.read_csv(DATA_DIR / "Drug_Info.csv", sep="~", encoding="utf-8-sig")


@pytest.fixture(scope="session")
def real_claims_df(claims_df):
    """Claims excluding flagged NDCs (Kryptonite XR)."""
    return claims_df[claims_df["NDC"] != 65862020190]


@pytest.fixture(scope="session")
def merged_df(claims_df, drugs_df):
    """Claims joined to drug_info on NDC."""
    return claims_df.merge(
        drugs_df[["NDC", "DRUG_NAME", "LABEL_NAME", "MONY", "MANUFACTURER_NAME"]],
        on="NDC",
        how="left",
    )
