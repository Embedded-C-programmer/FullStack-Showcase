import React from 'react';
import { Filter, CheckCircle, Circle, List } from 'lucide-react';
import { useTask } from '../../context/TaskContext';
import './FilterBar.css';

const FilterBar = () => {
    const { filter, setFilter, stats } = useTask();

    const filters = [
        {
            value: 'all',
            label: 'All Tasks',
            count: stats.total,
            icon: List,
            color: '#667eea',
            description: 'View all tasks'
        },
        {
            value: 'active',
            label: 'Active',
            count: stats.active,
            icon: Circle,
            color: '#ed8936',
            description: 'Tasks in progress'
        },
        {
            value: 'completed',
            label: 'Completed',
            count: stats.completed,
            icon: CheckCircle,
            color: '#48bb78',
            description: 'Finished tasks'
        }
    ];

    return (
        <div className="filter-bar">
            <div className="filter-header">
                <Filter size={20} className="filter-icon-main" />
                <div className="filter-header-text">
                    <span className="filter-title">Filter Tasks</span>
                    <span className="filter-subtitle">Choose a view to organize your tasks</span>
                </div>
            </div>

            <div className="filter-buttons">
                {filters.map((f) => {
                    const Icon = f.icon;
                    return (
                        <button
                            key={f.value}
                            onClick={() => setFilter(f.value)}
                            className={`filter-button ${filter === f.value ? 'active' : ''}`}
                            title={f.description}
                            style={{
                                '--filter-color': f.color
                            }}
                        >
                            <Icon size={18} className="filter-icon" />
                            <div className="filter-content">
                                <span className="filter-label">{f.label}</span>
                                <span className="filter-count-badge">{f.count}</span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default FilterBar;

