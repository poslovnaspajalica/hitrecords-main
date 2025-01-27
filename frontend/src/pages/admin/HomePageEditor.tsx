import React, { useState } from 'react';
import { Tabs, Card, Form, Input, Button, Upload, Switch, DatePicker, Spin, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useHomePageContent } from '../../hooks/useHomePageContent';

const { TabPane } = Tabs;

export const HomePageEditor: React.FC = () => {
  const { sections, loading, error, updateSectionOrder } = useHomePageContent();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const handleSectionAdd = (type: string) => {
    // Implementacija dodavanja nove sekcije
  };

  const handleSectionUpdate = (sectionId: string, data: any) => {
    // Implementacija ažuriranja sekcije
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    const updatedSections = items.map((item, index) => ({
      ...item,
      order: index
    }));

    updateSectionOrder(updatedSections);
  };

  if (loading) return <Spin size="large" />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="homepage-editor">
      <div className="header">
        <h1>Urednik naslovnice</h1>
        <Button type="primary" icon={<PlusOutlined />}>
          Dodaj sekciju
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sections.map((section, index) => (
                <Draggable
                  key={section.id}
                  draggableId={section.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Card title={section.title} style={{ marginBottom: 16 }}>
                        {/* TODO: Implementirati uređivanje sadržaja sekcije */}
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}; 