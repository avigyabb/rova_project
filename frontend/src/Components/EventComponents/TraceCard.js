import '../../styles/EventComponentsStyles/TraceCard.css';

import ViewTimelineIcon from '@mui/icons-material/ViewTimeline';
import BorderClearIcon from '@mui/icons-material/BorderClear';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SchemaIcon from '@mui/icons-material/Schema';
import ErrorIcon from '@mui/icons-material/Error';
import React, { useState, useEffect } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

const TraceCard = ({ selectedEvent, selectedTrace, setSelectedEvent, setSelectedTrace }) => {
  
  const [traceSummary, setTraceSummary] = useState("");
  const [similarTraces, setSimilarTraces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  var trace_id = -1
  if(selectedEvent['event_name'] === 'LLM Trace') {
    trace_id = selectedEvent['events'][0]['trace_id']
  }
  useEffect(() => {
    const fetchData = async () =>  {
      setIsLoading(true);
      try {
        const params = {
          trace_id: trace_id
        }
        const summary = await axios.get(process.env.REACT_APP_API_URL + 'get-summary/', {params});
        const similar_traces = await axios.get(process.env.REACT_APP_API_URL + 'get-similar-traces/', {params});
        setTraceSummary(summary.data.summary);
        console.log(similar_traces.data.similar_traces)
        setSimilarTraces(similar_traces.data.similar_traces)
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
        console.log(similarTraces)
      }
    };
    fetchData();
  }, [selectedEvent]);

  return (
    <div className="right-column">
      <div className='event-metadata-navbar flex items-center'>
        <KeyboardDoubleArrowRightIcon className="back-icon mr-2" fontSize="large" onClick={() => setSelectedEvent(null)}/>
        <h1 className='text-xl'> Execution of {JSON.stringify(selectedEvent.event_name)} </h1>
      </div>
        {selectedEvent.table_source == "llm" && (
          <div className="event-metadata-content">
            <div className="sidebar flex flex-col">
              <div className="traceBox mb-1 flex" onClick={() => setSelectedTrace(null)}>
                <ViewTimelineIcon className="mr-2"/>
                Trace
              </div>
              {selectedEvent.events.map((trace, index) => (
                <div className="traceBox flex flex-row items-center" onClick={() => setSelectedTrace(trace)}> 
                  <BorderClearIcon className="ml-2 mr-2"/>
                  <p className='text-sm'> {JSON.stringify(trace.event_name)} </p>
                  { trace.error_status !== "" && trace.error_status !== "none" && (
                    < ErrorIcon fontSize='small ml-4' style={{color: '#B02300'}}/>
                  )}
                </div>
              ))}
            </div>
            <div className="trace-content">
              {selectedTrace ? (
                <div>
                  <div className='flex'>
                    <SchemaIcon className="mr-2"/>
                    <p className='text-3xl'> Step Info </p>
                    <p className='ml-auto text-sm text-gray-400'> {new Date(selectedTrace.timestamp).toLocaleString()} </p>
                  </div>
                  <div className='input-text-header mt-5' style={{backgroundColor: 'gray'}}> INPUT </div>
                  <textarea
                    className='input-text'
                    value={selectedTrace.input_content}
                    style={{fontSize: 'small'}}
                  />
                  
                  <div 
                    className='input-text-header mt-3' 
                    style={{
                      borderTop: selectedTrace.error_status === "none" ? '2px solid lightgreen' : '2px solid red', 
                      borderLeft: selectedTrace.error_status === "none" ? '2px solid lightgreen' : '2px solid red', 
                      borderRight: selectedTrace.error_status === "none" ? '2px solid lightgreen' : '2px solid red', 
                      borderBottom: 'none',
                      color: 'gray'
                    }}> 
                    OUTPUT 
                  </div>
                  <textarea
                    className='input-text'
                    value={selectedTrace.output_content}
                    style={{
                      borderBottom: selectedTrace.error_status === "none" ? '2px solid lightgreen' : '2px solid red', 
                      borderLeft: selectedTrace.error_status === "none" ? '2px solid lightgreen' : '2px solid red', 
                      borderRight: selectedTrace.error_status === "none" ? '2px solid lightgreen' : '2px solid red', 
                      borderTop: 'none',
                      fontSize: 'small',
                    }}
                  />

                  {/* <div className='input-text mt-3' style={{borderRadius: '10px', border: selectedTrace.error_status === "none" ? '2px solid lightgreen' : '2px solid red'}}>
                    <p className='text-sm mb-2'> OUTPUT </p>
                    <textarea
                      className = 'input-text' style = {{border : 'none'}}
                      value = {selectedTrace.output_content}
                    />
                  </div> */}
                  <div className='flex items-end'>
                    <p className='metric-label mt-2 ml-2'> STATUS </p>
                    <p className='ml-2 text-sm'> {JSON.stringify(selectedTrace.error_status)} </p>
                  </div>

                  <div className='flex justify-evenly mt-12'>
                    <div>
                      <p className='metric-label'> LATENCY </p>
                      <p> {JSON.stringify(selectedTrace.latency).slice(0, 5)}s </p>
                    </div>
                    <div>
                      <p className='metric-label'> TOKEN COUNT </p>
                      <p> {JSON.stringify(+selectedTrace.input_token_count + +selectedTrace.output_token_count)} tokens </p>
                    </div>
                    <div>
                      <p className='metric-label'> COST </p>
                      <p> ${JSON.stringify(selectedTrace.latency).slice(0, 4)} </p>
                    </div>
                  </div>

                </div>
              ) : (
                <div>
                  <div className='flex'>
                    <SchemaIcon className="mr-2"/>
                    <p className='text-3xl'> Trace Info </p>
                    
                    <p className='ml-auto text-sm text-gray-400'> {new Date(selectedEvent.events[0].timestamp).toLocaleString()} </p>
                  </div>
                  <div className='flex justify-evenly mt-5'>
                    <div>
                      <p className='metric-label'> START TIME </p>
                      <p className='text-sm'>  {new Date(selectedEvent.events[0].timestamp).toLocaleString()} </p>
                    </div>
                    <div>
                      {/* not correct */}
                      <p className='metric-label'> END TIME </p>
                      <p className='text-sm'>  {new Date(selectedEvent.events[0].timestamp).toLocaleString()} </p>
                    </div>
                  </div>

                  <p className='metric-label mt-10'> SESSION ID </p>
                  <p className='text-sm mb-5'>  {JSON.stringify(selectedEvent.events[0].session_id)} </p>
                  {isLoading ? (
                    <div className="flex justify-center items-center">
                      <CircularProgress style={{ color: '#FFA189' }}/>
                    </div>
                  ) : (
                  <div>
                    {/* Trace Summary */}
                    <div className='input-text mt-3'>
                      <p className='text-sm mb-5'> {traceSummary} </p>
                    </div>
                    {/* Similar Traces Section */}
                    <div className="similar-traces-section mt-3">
                      <h2 className="text-lg mb-2 font-semibold">Similar Traces</h2>
                      {Object.keys(similarTraces).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {Object.entries(similarTraces).map(([traceId, similarity]) => (
                            <div key={traceId} className="card bg-white shadow-lg rounded-lg p-4">
                              <h3 className="text-md font-semibold"> {traceId}</h3>
                              <p className="text-sm">Similarity: {similarity.toFixed(2)}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p>No similar traces found.</p>
                      )}
                    </div>
                  </div>
                  )}

                </div>
              )
              }
            </div>
          </div>
        )}
        {selectedEvent.table_source == "product" && (
          <div className="event-metadata-content">
            <pre> {JSON.stringify(selectedEvent || {}, null, 2)} </pre>
          </div>
        )}
    </div>
  );
};

export default TraceCard;
