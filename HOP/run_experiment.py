"""
run_experiment.py

Main entry point. Runs naive and/or replay baselines and saves results.

Usage:
    # Quick sanity check (~2-5 min on CPU, verifies everything runs)
    python run_experiment.py --mode sanity

    # Full experiment (overnight on CPU, or ~30min on Colab T4)
    python run_experiment.py --mode full

    # Run only one method
    python run_experiment.py --mode full --method naive
    python run_experiment.py --mode full --method replay

    # Sweep buffer sizes (for the paper-quality analysis)
    python run_experiment.py --mode full --sweep_buffer

Results saved to ./results/
"""

import os
import sys
import argparse
import torch
import random
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from data.cifar10_tasks import get_task_datasets
from models.resnet      import build_model
from train.naive        import run_naive
from train.replay       import run_replay


def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def parse_args():
    p = argparse.ArgumentParser(description="Hopfield Continual Learning Experiment")
    p.add_argument("--mode",   choices=["sanity", "full"], default="sanity",
                   help="sanity: fast smoke test | full: proper experiment")
    p.add_argument("--method", choices=["naive", "replay", "both"], default="both",
                   help="which method(s) to run")
    p.add_argument("--seed",   type=int, default=42)
    p.add_argument("--sweep_buffer", action="store_true",
                   help="sweep buffer sizes [100, 200, 500] (full mode only)")
    p.add_argument("--results_dir", default="./results")
    return p.parse_args()


def get_config(mode: str) -> dict:
    if mode == "sanity":
        return dict(
            n_tasks=3,
            n_epochs=2,
            batch_size=32,
            lr=0.05,
            sanity_samples=300,    # 300 train, 60 test per task
            capacity_per_task=100,
            n_replay_per_task=30,
        )
    return dict(
        n_tasks=5,
        n_epochs=10,
        batch_size=64,
        lr=0.05,
        sanity_samples=None,       # full CIFAR-10
        capacity_per_task=200,
        n_replay_per_task=50,
    )


def run_experiment(args, cfg, results_dir, buffer_capacity=None):
    set_seed(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    print(f"\n{'='*60}")
    print(f"Mode: {args.mode} | Device: {device} | Seed: {args.seed}")
    if buffer_capacity:
        print(f"Buffer capacity: {buffer_capacity} samples/task")
    print(f"{'='*60}")

    train_tasks, test_tasks = get_task_datasets(
        n_tasks=cfg["n_tasks"],
        sanity_samples=cfg["sanity_samples"],
    )

    cap = buffer_capacity or cfg["capacity_per_task"]
    os.makedirs(results_dir, exist_ok=True)

    if args.method in ("naive", "both"):
        set_seed(args.seed)
        model   = build_model()
        tracker = run_naive(
            model, train_tasks, test_tasks,
            n_epochs=cfg["n_epochs"],
            batch_size=cfg["batch_size"],
            lr=cfg["lr"],
            device=device,
        )
        tracker.print_summary("naive")
        suffix = f"_buf{cap}" if buffer_capacity else ""
        tracker.plot(
            os.path.join(results_dir, f"naive{suffix}.png"),
            method_name="naive"
        )

    if args.method in ("replay", "both"):
        set_seed(args.seed)
        model   = build_model()
        tracker = run_replay(
            model, train_tasks, test_tasks,
            n_epochs=cfg["n_epochs"],
            batch_size=cfg["batch_size"],
            lr=cfg["lr"],
            capacity_per_task=cap,
            n_replay_per_task=cfg["n_replay_per_task"],
            device=device,
        )
        tracker.print_summary(f"replay (buf={cap})")
        suffix = f"_buf{cap}" if buffer_capacity else ""
        tracker.plot(
            os.path.join(results_dir, f"replay{suffix}.png"),
            method_name=f"replay buf={cap}"
        )


def main():
    args = parse_args()
    cfg  = get_config(args.mode)

    if args.sweep_buffer and args.mode == "full":
        for cap in [100, 200, 500]:
            run_experiment(args, cfg, args.results_dir, buffer_capacity=cap)
    else:
        run_experiment(args, cfg, args.results_dir)

    print(f"\nDone. Results saved to {args.results_dir}/")


if __name__ == "__main__":
    main()