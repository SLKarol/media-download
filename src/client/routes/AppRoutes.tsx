import { Routes, Route } from 'react-router-dom';

import HomePage from '@client/pages/Home/HomePage';
import VideoContent from '@client/pages/VideoContent/VideoContent';
import Settings from '@client/pages/Settings';
import ReportDownload from '@client/pages/ReportDownload';
import RedditNew from '@client/pages/WhatNew/RedditNew';
import YaplakalNew from '@client/pages/WhatNew/YaplakalNew';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/videoContent/" element={<VideoContent />} />
      <Route path="/settings/" element={<Settings />} />
      <Route path="/reportDownload/" element={<ReportDownload />} />
      <Route path="/redditNew/" element={<RedditNew />} />
      <Route path="/yaplakalNew/" element={<YaplakalNew />} />
    </Routes>
  );
};

export default AppRoutes;
