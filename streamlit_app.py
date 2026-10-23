import streamlit as st
import pandas as pd
import numpy as np
import os
from PIL import Image

# ---------------------------------------------------------
# Page Configuration & Styling
# ---------------------------------------------------------
st.set_page_config(
    page_title="Formula 1 Race Analytics & Predictor (1950–2025)",
    page_icon="🏎️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom F1 Dark Mode Theme
st.markdown("""
<style>
    .main-header {
        font-size: 2.2rem;
        font-weight: 800;
        color: #E10600;
        margin-bottom: 0.2rem;
    }
    .sub-header {
        font-size: 1.1rem;
        color: #A0AEC0;
        margin-bottom: 1.5rem;
    }
    .metric-card {
        background-color: #1A1F2C;
        border-left: 4px solid #E10600;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
    }
    .stTabs [data-baseweb="tab-list"] {
        gap: 10px;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 8px 16px;
        border-radius: 4px;
    }
</style>
""", unsafe_allow_html=True)

# ---------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FIGURES_DIR = os.path.join(BASE_DIR, "figures")
DATA_DIR = os.path.join(BASE_DIR, "data")

def load_image(filename):
    path = os.path.join(FIGURES_DIR, filename)
    if os.path.exists(path):
        return Image.open(path)
    return None

@st.cache_data
def load_csv_data(filename):
    path = os.path.join(DATA_DIR, filename)
    if os.path.exists(path):
        return pd.read_csv(path)
    return None

# ---------------------------------------------------------
# Sidebar Navigation
# ---------------------------------------------------------
st.sidebar.image("https://upload.wikimedia.org/wikipedia/commons/3/33/F1.svg", width=120)
st.sidebar.title("🏁 Pit Wall Analytics")
st.sidebar.markdown("**FODS Case Study (1950–2025)**  \n*Amrita Vishwa Vidyapeetham*")

page = st.sidebar.radio(
    "Navigate",
    [
        "🏎️ Live Race Predictor",
        "📊 15 Research Questions",
        "📈 Exploratory Data Analysis",
        "🔍 Dataset Explorer",
        "👥 About the Study"
    ]
)

st.sidebar.markdown("---")
st.sidebar.info("""
**Authors:**
- **R. Meghapranay**
- **P. Krishna Chaitanya**
- **M. Rishit Kumar**
- **K. Aditya**
""")

# =========================================================
# Page 1: Live Race Predictor (OLS & ML Model)
# =========================================================
if page == "🏎️ Live Race Predictor":
    st.markdown('<div class="main-header">🏎️ F1 Finishing Position Predictor</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Pre-race multiple linear regression model with factor contribution & 95% prediction intervals.</div>', unsafe_allow_html=True)

    col_model_info, col_metrics = st.columns([2, 1])
    with col_model_info:
        st.write("""
        This live predictor is calibrated using our Multiple Linear Regression (OLS) model trained on historical Formula 1 race sessions.
        The model achieves **$R^2 = 0.600$** with a Mean Absolute Error (**MAE**) of **2.50 finishing positions**, verified on unseen 2024–2025 race data.
        """)
    with col_metrics:
        m1, m2 = st.columns(2)
        m1.metric("Model $R^2$", "0.600", "OLS Baseline")
        m2.metric("Mean Abs Error", "±2.50", "Positions")

    st.markdown("### 🔧 Configure Pre-Race Parameters")
    c1, c2, c3 = st.columns(3)

    with c1:
        grid_pos = st.slider("Starting Grid Position", min_value=1, max_value=20, value=3)
        constructor_tier = st.selectbox(
            "Constructor Tier",
            [
                "Tier 1: Top 4 (Red Bull, Ferrari, McLaren, Mercedes)",
                "Tier 2: Midfield (Aston Martin, Alpine, RB)",
                "Tier 3: Lower Midfield (Williams, Haas, Sauber)"
            ]
        )

    with c2:
        driver_exp = st.slider("Driver Career Starts (Experience)", min_value=1, max_value=400, value=120)
        recent_points_avg = st.slider("Recent 5 Races Avg Points", min_value=0.0, max_value=25.0, value=12.0, step=0.5)

    with c3:
        circuit_type = st.selectbox("Circuit Profile", ["Permanent Track", "Street Circuit (Monaco/Baku/Singapore)"])
        weather_condition = st.selectbox("Weather Condition", ["Dry Race", "Rain / Mixed Conditions"])

    # Predictor logic based on OLS case study coefficients
    # Baseline grid coefficient ~ 0.58; tier bonuses; experience effect; circuit volatility
    tier_bonus = -3.2 if "Tier 1" in constructor_tier else (0.0 if "Tier 2" in constructor_tier else 3.4)
    form_bonus = -0.18 * recent_points_avg
    exp_bonus = -0.008 * min(driver_exp, 200)
    street_factor = 0.6 if circuit_type == "Street Circuit (Monaco/Baku/Singapore)" else 0.0
    rain_uncertainty = 1.8 if weather_condition == "Rain / Mixed Conditions" else 0.9

    raw_prediction = 1.65 + (0.58 * grid_pos) + tier_bonus + form_bonus + exp_bonus
    predicted_position = float(np.clip(raw_prediction, 1.0, 20.0))
    lower_bound = max(1.0, predicted_position - (1.96 * rain_uncertainty))
    upper_bound = min(20.0, predicted_position + (1.96 * rain_uncertainty))

    st.markdown("---")
    st.markdown("### 🏆 Prediction Results")
    res_col1, res_col2, res_col3, res_col4 = st.columns(4)
    res_col1.metric("Predicted Finish", f"P{predicted_position:.1f}")
    res_col2.metric("95% Conf. Interval", f"P{lower_bound:.1f} – P{upper_bound:.1f}")
    res_col3.metric("Podium Chance", f"{max(0, min(100, int((4 - predicted_position) * 22)))}%" if predicted_position <= 4.5 else "< 5%")
    res_col4.metric("Points Finish (Top 10)", "Yes (High Prob)" if predicted_position <= 10.0 else "Unlikely")

    st.markdown("#### Model Performance Diagnostics from Study")
    d1, d2 = st.columns(2)
    with d1:
        img_perf = load_image("q14_model_performance.png")
        if img_perf:
            st.image(img_perf, caption="Actual vs Predicted Finish (OLS & Ensembles)", use_container_width=True)
    with d2:
        img_feat = load_image("q15_feature_importance.png")
        if img_feat:
            st.image(img_feat, caption="Top Pre-Race Predictive Feature Importances", use_container_width=True)

# =========================================================
# Page 2: 15 Research Questions
# =========================================================
elif page == "📊 15 Research Questions":
    st.markdown('<div class="main-header">📊 15 Core Research Questions</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Statistical modeling, hypothesis testing, and empirical conclusions from 1950–2025 data.</div>', unsafe_allow_html=True)

    questions_dict = {
        "Q1: Grid vs Finishing Position Across Eras": {
            "file": "q1_grid_vs_finish.png",
            "stat": "Correlation r = 0.74 in modern era vs 0.48 in 1950s.",
            "desc": "Starting grid position has become increasingly predictive of final race classification over the history of the sport due to improved aerodynamic wake sensitivity and extreme car reliability."
        },
        "Q2: Pole Position Conversion Across Eras": {
            "file": "q2_pole_conversion.png",
            "stat": "Hybrid era conversion: 55.4% vs V10 era: 44.1% (p < 0.01).",
            "desc": "Testing whether pole sitters win more frequently in the turbo-hybrid era compared to earlier high-displacement eras. The conversion rate significantly increased."
        },
        "Q3: Circuit Lollipop – Qualifying Importance": {
            "file": "q3_circuit_lollipop.png",
            "stat": "Monaco: 73.1% pole-to-podium conversion rate.",
            "desc": "Monaco, Singapore, and Hungaroring penalize sub-optimal qualifying positions most severely, while Spa and Monza allow significant overtaking recovery."
        },
        "Q4: Constructor Dominance (HHI Index)": {
            "file": "q4_dominance.png",
            "stat": "Peak HHI > 4,500 in 2023 (Red Bull RB19).",
            "desc": "Herfindahl-Hirschman Index (HHI) tracking constructor win concentrations reveals periodic multi-year hegemony cycles punctuated by major regulatory overhauls."
        },
        "Q5: Car vs Driver Variance Decomposition": {
            "file": "q5_car_vs_driver.png",
            "stat": "Car: ~60.4%, Driver: ~4.5%, Unexplained/Luck: ~35.2%.",
            "desc": "Nested two-way ANOVA decomposition confirms that machinery explains the vast majority of performance variance across Grand Prix race results."
        },
        "Q6: Mechanical Reliability & DNF Causes": {
            "file": "q6_reliability.png",
            "stat": "Mechanical DNF rate dropped from 44% (1970s) to < 6% (2020s).",
            "desc": "Modern computational engineering, dynamometer benchmarking, and penalty-enforced powertrain limits have virtually eliminated spontaneous mechanical failure."
        },
        "Q7: Pit Stop Consistency & Strategy": {
            "file": "q7_pit_stops.png",
            "stat": "Median stop: 2.3s (2020s) with IQR reduced by 72%.",
            "desc": "Comparison of pit crew execution times and optimal 1-stop vs 2-stop strategies under differing tire degradation regimes."
        },
        "Q8: Driver Career Peak – Age vs Experience": {
            "file": "q8_career_peak.png",
            "stat": "Optimal peak window: Ages 26–31 with 4–7 years F1 experience.",
            "desc": "Non-linear polynomial regression isolates biological aging from cumulative race mileage experience."
        },
        "Q9: Home Grand Prix Advantage": {
            "file": "q9_home_advantage.png",
            "stat": "Two-sample Welch t-test: p = 0.38 (statistically insignificant).",
            "desc": "No statistically significant home circuit advantage was found when controlling for constructor baseline strength."
        },
        "Q10: Circuit Types & Race Completion Rates": {
            "file": "q10_nationality.png",
            "stat": "Chi-square Test: p < 0.001.",
            "desc": "Street circuits experience significantly higher accident attrition and Safety Car deployment probabilities than dedicated permanent racing facilities."
        },
        "Q11: 2022 Ground-Effect Regulations Impact": {
            "file": "q11_regulation_ab.png",
            "stat": "A/B Hypothesis Test: Mean overtakes +18.4% in 2022–2023.",
            "desc": "Evaluating whether venturi-tunnel aerodynamics successfully reduced dirty air wake disturbance and encouraged closer racing."
        },
        "Q12: Street Circuits vs Permanent Circuits": {
            "file": "q12_street_vs_permanent.png",
            "stat": "Mann-Whitney U Test: W = 1420.5, p < 0.01.",
            "desc": "Direct distributional comparison of overtaking counts and yellow flag frequencies between street tracks and traditional road courses."
        },
        "Q13: Early Season Championship Decision Point": {
            "file": "q13_title_decided.png",
            "stat": "Title locked by 70% race mark in 42% of modern seasons.",
            "desc": "Binomial proportions and points accumulation trajectory tracking how early the Drivers' World Championship is mathematically clinched."
        },
        "Q14: Predictive Modeling (OLS & ML)": {
            "file": "q14_model_performance.png",
            "stat": "OLS R² = 0.600, MAE = 2.50 positions on unseen test set.",
            "desc": "Supervised learning pipeline benchmarking OLS regression against Random Forest and Gradient Boosting architectures."
        },
        "Q15: Strategy & Feature Importance": {
            "file": "q15_feature_importance.png",
            "stat": "Top features: Starting Grid (44%), Team Tier (31%), Rolling Form (14%).",
            "desc": "Permutation feature importance identifying critical pre-race variables governing finishing results and pit wall tactical decision-making."
        }
    }

    selected_q = st.selectbox("Select a Research Question to inspect:", list(questions_dict.keys()))
    q_data = questions_dict[selected_q]

    c1, c2 = st.columns([1.2, 1])
    with c1:
        img = load_image(q_data["file"])
        if img:
            st.image(img, caption=selected_q, use_container_width=True)
        else:
            st.warning("Figure file not found.")

    with c2:
        st.markdown(f"### 📋 Statistical Summary")
        st.info(f"**Key Finding / Metric:**  \n{q_data['stat']}")
        st.write(f"**Detailed Interpretation:**  \n{q_data['desc']}")

# =========================================================
# Page 3: Exploratory Data Analysis (EDA)
# =========================================================
elif page == "📈 Exploratory Data Analysis":
    st.markdown('<div class="main-header">📈 Exploratory Data Analysis</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Comprehensive statistical overviews across 76 Formula 1 World Championship seasons.</div>', unsafe_allow_html=True)

    tab1, tab2, tab3, tab4, tab5 = st.tabs([
        "🏆 Top Winners",
        "📊 Correlation Matrix",
        "🌍 Driver Demographics",
        "🗓️ Calendar Evolution",
        "🎯 Outlier Diagnostics"
    ])

    with tab1:
        img = load_image("eda_top_winners.png")
        if img:
            st.image(img, caption="All-time Grand Prix Race Winners", use_container_width=True)

    with tab2:
        img = load_image("eda_correlation.png")
        if img:
            st.image(img, caption="Correlation Matrix of Numerical Features", use_container_width=True)

    with tab3:
        img = load_image("eda_age_nationality.png")
        if img:
            st.image(img, caption="Driver Age Distribution & Nationality Breakdown", use_container_width=True)

    with tab4:
        img = load_image("eda_calendar.png")
        if img:
            st.image(img, caption="F1 Calendar Expansion (1950 to 2025)", use_container_width=True)

    with tab5:
        img = load_image("prep_outliers.png")
        if img:
            st.image(img, caption="Data Preprocessing & Outlier Treatment", use_container_width=True)

# =========================================================
# Page 4: Dataset Explorer
# =========================================================
elif page == "🔍 Dataset Explorer":
    st.markdown('<div class="main-header">🔍 Jolpica F1 Dataset Explorer</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Explore cleaned tabular data tables powering the case study.</div>', unsafe_allow_html=True)

    csv_files = {
        "🏁 Circuits": "formula_one_circuit.csv",
        "🏎️ Drivers": "formula_one_driver.csv",
        "🛠️ Teams (Constructors)": "formula_one_team.csv",
        "🛑 Pit Stops": "formula_one_pitstop.csv",
        "📅 Championship Seasons": "formula_one_season.csv",
        "🏁 Grand Prix Rounds": "formula_one_round.csv"
    }

    selected_dataset = st.selectbox("Select Table to Inspect:", list(csv_files.keys()))
    df = load_csv_data(csv_files[selected_dataset])

    if df is not None:
        c1, c2, c3 = st.columns(3)
        c1.metric("Rows", f"{df.shape[0]:,}")
        c2.metric("Columns", f"{df.shape[1]}")
        c3.metric("Memory Usage", f"{df.memory_usage().sum() / 1024:.1f} KB")

        st.dataframe(df.head(100), use_container_width=True)

        with st.expander("📊 View Summary Statistics"):
            st.write(df.describe(include="all"))
    else:
        st.warning("Table file could not be loaded from data directory.")

# =========================================================
# Page 5: About the Study
# =========================================================
elif page == "👥 About the Study":
    st.markdown('<div class="main-header">👥 About This Research Project</div>', unsafe_allow_html=True)
    st.markdown("""
    ### Formula 1 Race Analytics (1950–2025): FODS Case Study
    **Course:** 23CSE351 Foundations of Data Science (FODS)  
    **Institution:** Department of Computer Science and Engineering, Amrita Vishwa Vidyapeetham  

    ---
    ### 👨‍💻 Research Authors
    - **R. Meghapranay** (CB.SC.U4CSE24440) — Statistical Modeling & OLS Regression
    - **P. Krishna Chaitanya** (CB.SC.U4CSES24436) — Hypothesis Testing & Permutation Lab
    - **M. Rishit Kumar** (CB.SC.U4CSE24428) — Variance Decomposition & Bradley–Terry Model
    - **K. Aditya** (CB.SC.U4CSE24423) — Exploratory Data Analysis & Spatial Pipeline

    ---
    ### 📑 Methodology Highlights
    - **Dataset:** Jolpica F1 open database (official successor to Ergast Developer API) covering all 1,125+ Grand Prix races from 1950 to 2025.
    - **Hypothesis Testing:** Two-sample Student's t, Welch's t, Mann-Whitney U, Pearson Chi-Square, and Nested ANOVA.
    - **Multiple Linear Regression:** OLS with cluster-robust standard errors achieving $R^2 = 0.600$ and $\text{MAE} = 2.50$ finishing positions.
    """)
    img_dash = load_image("dashboard_static.png")
    if img_dash:
        st.image(img_dash, caption="Pit Wall Case Study Overview", use_container_width=True)
