import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, ListTodo, TrendingUp } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import './StatsCard.css';

const StatsCard = () => {
    const { stats } = useTask();
    const [animatedStats, setAnimatedStats] = useState({ total: 0, completed: 0, active: 0 });

    // Animate numbers
    useEffect(() => {
        const duration = 1000; // 1 second
        const steps = 60;
        const interval = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const progress = currentStep / steps;

            setAnimatedStats({
                total: Math.floor(stats.total * progress),
                completed: Math.floor(stats.completed * progress),
                active: Math.floor(stats.active * progress)
            });

            if (currentStep >= steps) {
                clearInterval(timer);
                setAnimatedStats(stats);
            }
        }, interval);

        return () => clearInterval(timer);
    }, [stats.total, stats.completed, stats.active]);

    const completionRate = stats.total > 0
        ? Math.round((stats.completed / stats.total) * 100)
        : 0;

    const statItems = [
        {
            label: 'Total Tasks',
            value: animatedStats.total,
            icon: ListTodo,
            color: '#667eea',
            bgColor: '#eef2ff',
            description: 'All tasks in your workspace'
        },
        {
            label: 'Completed',
            value: animatedStats.completed,
            icon: CheckCircle,
            color: '#48bb78',
            bgColor: '#f0fff4',
            description: 'Tasks you\'ve finished'
        },
        {
            label: 'Active',
            value: animatedStats.active,
            icon: Circle,
            color: '#ed8936',
            bgColor: '#fffaf0',
            description: 'Tasks in progress'
        },
    ];

    return (
        <div className="stats-section">
            <div className="stats-header">
                <TrendingUp size={20} className="stats-header-icon" />
                <div className="stats-header-text">
                    <h2 className="stats-title">Your Progress</h2>
                    <p className="stats-subtitle">Track your productivity at a glance</p>
                </div>
            </div>

            <div className="stats-container">
                {statItems.map((stat, index) => (
                    <div
                        key={stat.label}
                        className="stat-card"
                        style={{
                            background: stat.bgColor,
                            animationDelay: `${index * 0.1}s`
                        }}
                        title={stat.description}
                    >
                        <div className="stat-icon-wrapper" style={{ background: stat.color }}>
                            <stat.icon size={24} color="white" />
                        </div>
                        <div className="stat-content">
                            <div className="stat-value-wrapper">
                                <div className="stat-value" style={{ color: stat.color }}>
                                    {stat.value}
                                </div>
                                {stat.label === 'Completed' && stats.total > 0 && (
                                    <div className="completion-badge">
                                        {completionRate}%
                                    </div>
                                )}
                            </div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {stats.total > 0 && (
                <div className="progress-section">
                    <div className="progress-header">
                        <span className="progress-label">Overall Completion</span>
                        <span className="progress-percentage">{completionRate}%</span>
                    </div>
                    <div className="progress-bar-container">
                        <div
                            className="progress-bar-fill"
                            style={{
                                width: `${completionRate}%`,
                                background: completionRate === 100
                                    ? 'linear-gradient(90deg, #48bb78 0%, #38a169 100%)'
                                    : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)'
                            }}
                        >
                            {completionRate > 10 && (
                                <span className="progress-text">{completionRate}%</span>
                            )}
                        </div>
                    </div>
                    {completionRate === 100 && (
                        <div className="celebration-message">
                            🎉 Amazing! All tasks completed!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StatsCard;
