import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setCurrentWorkshop } from '../store/slices/workshopsSlice';
import Layout from '../components/layout/Layout';
import WorkshopDetail from '../components/workshops/WorkshopDetail';
import { useWorkshops } from '../hooks/useWorkshops';
import { motion } from 'framer-motion';

const WorkshopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { workshops, currentWorkshop, loading, error } = useSelector((state: RootState) => state.workshops);
  
  // Load workshops data
  useWorkshops();
  
  useEffect(() => {
    if (workshops.length > 0 && id) {
      const workshop = workshops.find(w => w.id === id);
      if (workshop) {
        dispatch(setCurrentWorkshop(workshop));
      } else {
        // Workshop not found
        navigate('/workshops');
      }
    }
  }, [workshops, id, dispatch, navigate]);
  
  if (loading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Loading workshop details...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!currentWorkshop) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Workshop not found</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <WorkshopDetail workshop={currentWorkshop} />
        </motion.div>
      </div>
    </Layout>
  );
};

export default WorkshopDetailPage;
