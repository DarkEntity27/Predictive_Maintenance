import streamlit as st
import requests
import pandas as pd

# -----------------------------
# Config
# -----------------------------
API_URL = "http://127.0.0.1:8000/assess/network"

st.set_page_config(
    page_title="Railway Predictive Maintenance",
    layout="wide"
)

st.title("🚆 Railway Track Predictive Maintenance Dashboard")

st.markdown(
    """
    This dashboard provides AI-driven fault prediction, 
    maintenance prioritization, and network-level insights 
    for railway infrastructure.
    """
)

# -----------------------------
# Input Section
# -----------------------------
st.sidebar.header("Input Segments")

num_segments = st.sidebar.number_input(
    "Number of track segments",
    min_value=1,
    max_value=10,
    value=3
)

segments = []

for i in range(num_segments):
    st.sidebar.subheader(f"Segment {i+1}")

    wear = st.sidebar.slider("Wear level", 0.0, 1.0, 0.3, 0.01, key=f"w{i}")
    alignment = st.sidebar.slider("Alignment deviation", 0.0, 10.0, 2.0, 0.1, key=f"a{i}")
    vibration = st.sidebar.slider("Vibration index", 0.0, 100.0, 30.0, 1.0, key=f"v{i}")
    env = st.sidebar.slider("Environment factor", 0.8, 1.2, 1.0, 0.01, key=f"e{i}")
    load = st.sidebar.slider("Load cycles", 100, 1000, 500, 10, key=f"l{i}")

    segments.append({
        "segment_id": i + 1,
        "features": [wear, alignment, vibration, env, load]
    })
def priority_color(priority):
    if priority == 1:
        return "🟢 Normal"
    elif priority == 2:
        return "🟡 Preventive"
    elif priority == 3:
        return "🟠 High Priority"
    else:
        return "🔴 Critical"


# -----------------------------
# API Call
# -----------------------------
if st.sidebar.button("Run Assessment"):
    with st.spinner("Assessing infrastructure health..."):
        response = requests.post(
            API_URL,
            json={"segments": segments},
            timeout=30
        )

    if response.status_code != 200:
        st.error(f"API Error: {response.text}")
    else:
        data = response.json()

        # -----------------------------
        # Network Summary
        # -----------------------------
        st.subheader("📊 Network-Level Summary")

        summary = data["network_summary"]

        col1, col2 = st.columns(2)

        with col1:
            st.metric(
                "Total Segments",
                summary["structured"]["total_segments"]
            )

        with col2:
            st.metric(
                "High Priority Segments",
                len(summary["structured"]["high_priority_segments"])
            )

        st.markdown("### 🧠 AI-Generated Summary")
        st.info(summary["narrative"])

        # -----------------------------
        # Segment Table
        # -----------------------------
        st.subheader("🛠 Segment-wise Assessment")

        rows = []
        for s in data["segments"]:
            rows.append({
                "Segment ID": s["segment_id"],
                "Fault": s["fault"],
                "Confidence": s["confidence"],
                "Priority Level": priority_color(s["priority"]),
                "Action": s["action"]
            })

        df = pd.DataFrame(rows)
        st.dataframe(df, use_container_width=True)


        # -----------------------------
        # Fault Distribution Chart
        # -----------------------------
        st.subheader("📈 Fault Distribution")

        fault_dist = summary["structured"]["fault_distribution"]
        chart_df = pd.DataFrame(
            list(fault_dist.items()),
            columns=["Fault Type", "Count"]
        )

        st.bar_chart(chart_df.set_index("Fault Type"))
