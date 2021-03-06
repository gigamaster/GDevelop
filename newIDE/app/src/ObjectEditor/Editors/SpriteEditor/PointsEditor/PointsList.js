// @flow
import * as React from 'react';
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from '../../../../UI/Table';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import newNameGenerator from '../../../../Utils/NewNameGenerator';
import { mapVector } from '../../../../Utils/MapFor';
import Window from '../../../../Utils/Window';
import styles from './styles';
import PointRow from './PointRow';
import useForceUpdate from '../../../../Utils/UseForceUpdate';
import { Column, Line, Spacer } from '../../../../UI/Grid';
import RaisedButton from '../../../../UI/RaisedButton';
import { Trans } from '@lingui/macro';
import AddIcon from '@material-ui/icons/Add';
const gd: libGDevelop = global.gd;

const SortablePointRow = SortableElement(PointRow);

type PointsListBodyProps = {|
  pointsContainer: gdSprite,
  onPointsUpdated: () => void,
|};

const PointsListBody = (props: PointsListBodyProps) => {
  const [nameErrors, setNameErrors] = React.useState({});
  const { pointsContainer } = props;
  const forceUpdate = useForceUpdate();

  const onPointsUpdated = () => {
    forceUpdate();
    props.onPointsUpdated();
  };

  const updateOriginPointX = newValue => {
    pointsContainer.getOrigin().setX(newValue);
    onPointsUpdated();
  };

  const updateOriginPointY = newValue => {
    pointsContainer.getOrigin().setY(newValue);
    onPointsUpdated();
  };

  const updateCenterPointX = newValue => {
    pointsContainer.getCenter().setX(newValue);
    onPointsUpdated();
  };

  const updateCenterPointY = newValue => {
    pointsContainer.getCenter().setY(newValue);
    onPointsUpdated();
  };

  const updatePointX = (point, newValue) => {
    point.setX(newValue);
    onPointsUpdated();
  };

  const updatePointY = (point, newValue) => {
    point.setY(newValue);
    onPointsUpdated();
  };

  const nonDefaultPoints = pointsContainer.getAllNonDefaultPoints();
  const pointsRows = mapVector(nonDefaultPoints, (point, i) => {
    const pointName = point.getName();

    return (
      <SortablePointRow
        index={i}
        disabled
        key={'point-' + pointName}
        pointX={point.getX()}
        pointY={point.getY()}
        onChangePointX={newValue => updatePointX(point, newValue)}
        onChangePointY={newValue => updatePointY(point, newValue)}
        pointName={pointName}
        nameError={nameErrors[pointName]}
        onBlur={event => {
          const newName = event.target.value;
          if (pointName === newName) return;

          let success = true;
          if (pointsContainer.hasPoint(newName)) {
            success = false;
          } else {
            point.setName(newName);
            onPointsUpdated();
          }

          setNameErrors(old => ({ ...old, [pointName]: !success }));
        }}
        onRemove={() => {
          const answer = Window.showConfirmDialog(
            "Are you sure you want to remove this point? This can't be undone."
          );
          if (!answer) return;

          pointsContainer.delPoint(pointName);
          onPointsUpdated();
        }}
      />
    );
  });

  const originPoint = pointsContainer.getOrigin();
  const centerPoint = pointsContainer.getCenter();

  const originRow = (
    <SortablePointRow
      index={0}
      key={'origin-point-row'}
      pointName="Origin"
      pointX={originPoint.getX()}
      pointY={originPoint.getY()}
      onChangePointX={updateOriginPointX}
      onChangePointY={updateOriginPointY}
      disabled
    />
  );
  const centerRow = (
    <SortablePointRow
      index={1}
      key={'center-point-row'}
      pointName="Center"
      isAutomatic={pointsContainer.isDefaultCenterPoint()}
      pointX={centerPoint.getX()}
      pointY={centerPoint.getY()}
      onChangePointX={updateCenterPointX}
      onChangePointY={updateCenterPointY}
      disabled
      onEdit={
        pointsContainer.isDefaultCenterPoint()
          ? () => {
              pointsContainer.setDefaultCenterPoint(false);
              onPointsUpdated();
            }
          : null
      }
      onRemove={
        !pointsContainer.isDefaultCenterPoint()
          ? () => {
              pointsContainer.setDefaultCenterPoint(true);
              onPointsUpdated();
            }
          : null
      }
    />
  );

  return <TableBody>{[originRow, centerRow, ...pointsRows]}</TableBody>;
};

const SortablePointsListBody = SortableContainer(PointsListBody);
SortablePointsListBody.muiName = 'TableBody';

type PointsListProps = {|
  pointsContainer: gdSprite,
  onPointsUpdated: () => void,
|};

const PointsList = (props: PointsListProps) => {
  return (
    <Column expand>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderColumn style={styles.handleColumn} />
            <TableHeaderColumn>Point name</TableHeaderColumn>
            <TableHeaderColumn style={styles.coordinateColumn}>
              X
            </TableHeaderColumn>
            <TableHeaderColumn style={styles.coordinateColumn}>
              Y
            </TableHeaderColumn>
            <TableRowColumn style={styles.toolColumn} />
          </TableRow>
        </TableHeader>
        <SortablePointsListBody
          pointsContainer={props.pointsContainer}
          onPointsUpdated={props.onPointsUpdated}
          onSortEnd={({ oldIndex, newIndex }) => {
            // Reordering points is not supported for now
          }}
          helperClass="sortable-helper"
          useDragHandle
          lockToContainerEdges
        />
      </Table>
      <Spacer />
      <Line alignItems="center" justifyContent="center">
        <RaisedButton
          primary
          icon={<AddIcon />}
          label={<Trans>Add a point</Trans>}
          onClick={() => {
            const name = newNameGenerator('Point', name =>
              props.pointsContainer.hasPoint(name)
            );
            const point = new gd.Point(name);
            props.pointsContainer.addPoint(point);
            point.delete();
            props.onPointsUpdated();
          }}
        />
      </Line>
    </Column>
  );
};

export default PointsList;
