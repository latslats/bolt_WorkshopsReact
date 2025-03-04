import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { registerForWorkshop } from '../store/slices/workshopsSlice';
import Layout from '../components/layout/Layout';
import WorkshopDetail from '../components/workshops/WorkshopDetail';
import { Workshop } from '../types';
import { toast } from 'react-hot-toast';

const WorkshopDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { workshops } = useSelector((state: RootState) => state.workshops);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  
  useEffect(() => {
    if (id && workshops.length > 0) {
      const foundWorkshop = workshops.find(w => w.id === id);
      if (foundWorkshop) {
        setWorkshop(foundWorkshop);
      } else {
        navigate('/workshops');
      }
    }
  }, [id, workshops, navigate]);
  
  const handleRegister = () => {
    if (!isAuthenticated) {
      toast.error('Please sign in to register for workshops');
      navigate('/login');
      return;
    }
    
    if (workshop) {
      dispatch(registerForWorkshop(workshop.id));
      toast.success(`Successfully registered for ${workshop.title}`);
    }
  };
  
  if (!workshop) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 dark:text-gray-400">Loading workshop details...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <WorkshopDetail 
        workshop={workshop} 
        onRegister={handleRegister}
      />
    </Layout>
  );
};

export default WorkshopDetailPage;
